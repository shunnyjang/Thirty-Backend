import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prize, Reward, User } from 'src/entities';
import { PrizeUserOwnedDto } from './dto/prize-user-owned.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: EntityRepository<Reward>,
    @InjectRepository(Prize)
    private readonly prizeRepository: EntityRepository<Prize>,
    private readonly em: EntityManager,
  ) {}

  async getUserRewardsList(user: User): Promise<PrizeUserOwnedDto[]> {
    return this.em.execute(`
      select r.id
           , p.prize_code
           , p.name
           , r.created_at
           , p.illust
           , case when r.id is null then false
             else true
             end as isOwned
        from prize p
        left join reward r
          on p.prize_code = r.prize_code
         and r.user_id = '${user.id}'
       order by p.prize_code asc;
    `);
  }

  async getRewardCountByUserId(userId: string): Promise<number> {
    return this.rewardRepository.count({ userId: userId });
  }

  /**
   * 출석 리워드
   * @param user
   * @returns
   */
  async getRewardAttendance(user: User): Promise<void> {
    const userId: string = user.id;
    const fulfilledDays: string[] = ['30', '07', '01'];
    for (const day of fulfilledDays) {
      const prizeCode = 'AT' + day;

      if (await this.isRewardExists(userId, prizeCode)) return;
      if (user.continuous_attendance !== Number(day)) continue;
      await this.createReward(userId, prizeCode);
    }
    this.rewardRepository.flush();
  }

  /**
   * 챌린지 달성 관련 리워드
   * @returns
   */
  async getRewardChallenge(user: User, completedBucketCount: number) {
    const userId: string = user.id;

    const fulfilledDays: string[] = ['30', '15', '01'];
    for (const day of fulfilledDays) {
      const prizeCode: string = 'CH' + day;

      if (await this.isRewardExists(userId, prizeCode)) return;
      if (completedBucketCount != Number(day)) continue;
      await this.createReward(userId, prizeCode);
    }
    this.rewardRepository.flush();
  }

  /**
   *
   * 친구 관련 리워드
   */
  async getRewardRelation(userId: string, relationshipNumber: number) {
    const fulfilledNumber: string[] = ['10', '05', '01'];
    for (const num of fulfilledNumber) {
      const prizeCode: string = 'FR' + num;

      if (await this.isRewardExists(userId, prizeCode)) return;
      if (relationshipNumber != Number(num)) continue;
      await this.createReward(userId, prizeCode);
    }
    this.rewardRepository.flush();
  }

  private async getAllPrizeList() {
    return this.prizeRepository.find(
      {},
      { orderBy: { prizeCode: QueryOrder.ASC } },
    );
  }

  private async getRewardListUserHave(user: User) {
    return this.rewardRepository.find({ userId: user.id });
  }

  private async createReward(userId: string, prizeCode: string): Promise<void> {
    if (await this.isRewardExists(userId, prizeCode))
      throw new BadRequestException(`이미 가지고 있는 뱃지 입니다.`);

    const prize = await this.prizeRepository.findOne({ prizeCode: prizeCode });
    if (!prize) {
      throw new BadRequestException(`존재하지 않는 뱃지입니다.`);
    }

    const reward: Reward = this.rewardRepository.create({
      userId: userId,
      prizeCode: prizeCode,
    });
    this.rewardRepository.persist(reward);
  }

  private async isRewardExists(userId: string, prizeCode: string) {
    const reward: Reward = await this.rewardRepository.findOne({
      userId: userId,
      prizeCode: prizeCode,
    });
    if (reward) return true;
    return false;
  }
}
