import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Notification, Relation, User } from 'src/entities';
import { RelationStatus } from 'src/relation/relation-stautus.enum';
import { RelationService } from 'src/relation/relation.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  NotificationType,
  NotificationTypeCode,
} from './notification-type.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: EntityRepository<Notification>,
    @Inject(forwardRef(() => RelationService))
    private readonly relationService: RelationService,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new Notification(createNotificationDto);
    this.notificationRepository.persistAndFlush(notification);
    return notification;
  }

  async getNotificationList(user: User): Promise<Notification[]> {
    return this.notificationRepository.find(
      { userId: user.id },
      { orderBy: { created_at: QueryOrder.DESC } },
    );
  }

  async updateNotification(
    userId: string,
    friendId: string,
    type: NotificationType,
  ) {
    const notification: Notification =
      await this.notificationRepository.findOne({
        userId: userId,
        relatedUserId: friendId,
        type: NotificationTypeCode.RELATION_RSVP,
      });
    if (!notification) {
      throw new BadRequestException(`존재하지 않는 친구신청 입니다.`);
    }

    notification.setNotificationMessage(type);
    notification.type = type;
    await this.notificationRepository.persistAndFlush(notification);
  }

  async checkReadNotification(
    user: User,
    notificationId: number,
  ): Promise<void> {
    const notification = await this.getNotificationById(notificationId);
    if (!(await this.isNotificationOwner(user, notification))) {
      throw new ForbiddenException(`권한이 없습니다.`);
    }

    notification.is_read = true;
    this.notificationRepository.persist(notification);
  }

  async saveNotificationAboutRSVP(
    userId: string,
    friendId: string,
    status: RelationStatus,
  ) {
    if (status === RelationStatus.CONFIRMED) {
      // Change My Notification To Relation_Confirmend
      await this.updateNotification(
        userId,
        friendId,
        NotificationTypeCode.RELATION_RSVP_CONFIRMED,
      );
      // Send Relation_RSVP_Confirmed to Friend Notification
      await this.createNotification({
        userId: friendId,
        relatedUserId: userId,
        type: NotificationTypeCode.RELATION_CONFIRMED,
      });
    } else {
      // Change My Notification To Relation_Denied
      await this.updateNotification(
        userId,
        friendId,
        NotificationTypeCode.RELATION_RSVP_DENIED,
      );
    }
  }

  async completedBucket(user: User, challengeName: string, bucketId: string) {
    this.sendNotificationToFriends(
      user,
      NotificationTypeCode.BUCKET_COMPLETED,
      challengeName,
      'bucket',
      bucketId,
    );
  }

  async registerAnswer(user: User, challengeName: string, bucketId: string) {
    this.sendNotificationToFriends(
      user,
      NotificationTypeCode.BUCKET_ANSWER,
      challengeName,
      'answer',
      `${bucketId}`,
    );
  }

  private async getNotificationById(
    notificationId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
    });
    if (notification) {
      return notification;
    }
    throw new BadRequestException(`존재하지 않는 알림입니다.`);
  }

  private async isNotificationOwner(
    user: User,
    notification: Notification,
  ): Promise<boolean> {
    if (user.id === notification.userId) {
      return true;
    }
    return false;
  }

  private async sendNotificationToFriends(
    user: User,
    type: NotificationType,
    challengeName: string,
    sourceName: string,
    sourceId: string,
  ) {
    const relations: Relation[] = await this.relationService.getRelationList(
      user,
    );
    for (const relation of relations) {
      const { friendId, ..._ } = relation;
      const notification = new Notification({
        userId: friendId,
        relatedUserId: user.id,
        type: type,
        sourceName: sourceName,
        sourceId: sourceId,
      });
      notification.setNotificationMessage(type, challengeName);
      this.notificationRepository.persist(notification);
    }
    this.notificationRepository.flush();
  }
}
