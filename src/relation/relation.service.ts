import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Relation, User } from 'src/entities';
import { NotificationTypeCode } from 'src/notification/notification-type.enum';
import { NotificationService } from 'src/notification/notification.service';
import { RewardService } from 'src/reward/reward.service';
import { CreateResponseRSVPDto } from './dto/create-resopnse-rsvp.dto';
import { RelationStatus } from './relation-stautus.enum';

@Injectable()
export class RelationService {
  constructor(
    @InjectRepository(Relation)
    private readonly relationRepository: EntityRepository<Relation>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly rewardService: RewardService,
  ) {}

  async getRelationList(user: User): Promise<Relation[]> {
    return this.relationRepository.find({
      userId: user.id,
      status: RelationStatus.CONFIRMED,
    });
  }

  async getRelationCountByUserId(userId: string): Promise<number> {
    return this.relationRepository.count({
      userId: userId,
      status: RelationStatus.CONFIRMED,
    });
  }

  async sendRSVP(user: User, friendId: string): Promise<Relation> {
    const userId: string = user.id;
    if (userId === friendId) {
      throw new BadRequestException(
        `옳지 못한 요청입니다: 요청 유저 ID와 친구 신청 유저 ID 동일.`,
      );
    }
    const userOwnedRelation = new Relation(userId, friendId);
    const friendOwnedRelelation = new Relation(friendId, userId);
    try {
      await this.relationRepository.persistAndFlush([
        userOwnedRelation,
        friendOwnedRelelation,
      ]);
    } catch (error) {
      // duplicate unique key
      if (error.code == 23505) {
        throw new BadRequestException(
          `이미 친구 신청을 보냈거나 친구 관계 입니다.`,
        );
      }
    }

    // Send Notification To Future Friend
    this.notificationService.createNotification({
      userId: friendId,
      type: NotificationTypeCode.RELATION_RSVP,
      relatedUserId: userId,
    });

    return userOwnedRelation;
  }

  async responseRSVP(
    userId: string,
    createResponseRSVPDto: CreateResponseRSVPDto,
  ): Promise<void> {
    const { friendId, status } = createResponseRSVPDto;
    if (status === RelationStatus.PENDING) {
      throw new BadRequestException(
        `대기 상태(PENDING)로는 수정 불가능합니다.`,
      );
    }

    const relationOfUser = await this.getByUserIdAndFriendId(userId, friendId);
    const relationOfFriend = await this.getByUserIdAndFriendId(
      friendId,
      userId,
    );
    relationOfUser.status = status;
    relationOfFriend.status = status;

    await this.notificationService.saveNotificationAboutRSVP(
      userId,
      friendId,
      status,
    );
    await this.relationRepository.flush();

    // Get Reward
    if (status === RelationStatus.CONFIRMED) {
      // create user's reward
      this.rewardService.getRewardRelation(
        userId,
        await this.getRelationCountByUserId(userId),
      );
      // create friend's reward
      this.rewardService.getRewardRelation(
        friendId,
        await this.getRelationCountByUserId(friendId),
      );
    }
  }

  async disconnect(userId: string, friendId: string): Promise<void> {
    this.relationRepository.remove(
      await this.getByUserIdAndFriendId(userId, friendId),
    );
    this.relationRepository.remove(
      await this.getByUserIdAndFriendId(friendId, userId),
    );
    await this.relationRepository.flush();
  }

  async getByUserIdAndFriendId(
    userId: string,
    friendId: string,
  ): Promise<Relation> {
    const relation = await this.relationRepository.findOne({
      userId: userId,
      friendId: friendId,
    });
    if (relation) return relation;
    throw new BadRequestException(`존재하지 않는 친구신청 입니다.`);
  }
}
