import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Prize, Reward, User } from 'src/entities';
import { RelationStatus } from 'src/relation/relation-stautus.enum';
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
    const allPrizeList: Prize[] = await this.getAllPrizeList();
    const rewardsListUserHave: Reward[] = await this.getRewardListUserHave(
      user,
    );
    return this.getPrizeObjectWithUserOwned(allPrizeList, rewardsListUserHave);
  }

  async getRewardCountByUserId(userId: string): Promise<number> {
    return this.rewardRepository.count({
      user_id: userId,
    });
  }

  async checkAndGetReward(user: User) {
    const rewards: any[] = [];
    rewards.push(await this.getRewardAttendance(user));
    rewards.push(await this.getRewardChallenge(user));
    rewards.push(await this.getRewardRelation(user));
    return rewards;
  }

  /**
   * 출석 리워드
   * @param user
   * @returns
   */
  private async getRewardAttendance(user: User): Promise<object | void> {
    const userId: string = user.id;
    const fulfilledDays: string[] = ['30', '07', '01'];
    for (const day of fulfilledDays) {
      const prizeCode = 'AT' + day;

      if (await this.isRewardExists(userId, prizeCode)) {
        return;
      }
      if (user.continuous_attendance !== Number(day)) {
        continue;
      }
      await this.createReward(userId, prizeCode);
      return this.getRewardResult(userId, prizeCode);
    }
  }

  /**
   * 챌린지 달성 관련 리워드
   * @returns
   */
  async getRewardChallenge(user: User) {
    const userId: string = user.id;
    const maxAnswerCount: number = await this.getMaximumAnswerCount(userId);
    if (maxAnswerCount < 1) {
      return;
    }

    const fulfilledDays: string[] = ['30', '15', '01'];
    for (const day of fulfilledDays) {
      const prizeCode: string = 'CH' + day;

      if (await this.isRewardExists(userId, prizeCode)) {
        return;
      }
      if (maxAnswerCount != Number(day)) {
        continue;
      }
      await this.createReward(userId, prizeCode);
      return this.getRewardResult(userId, prizeCode);
    }
  }

  /**
   *
   * 친구 관련 리워드
   */
  async getRewardRelation(user: User) {
    const userId: string = user.id;
    const relationshipNumber = await this.em.execute(`
      select subject_user_id
           , count(*)
        from relation
       where 1=1
         and subject_user_id = '${userId}'
         and status = '${RelationStatus.CONFIRMED}'
       group by subject_user_id
    `)[0];

    const fulfilledNumber: string[] = ['10', '05', '01'];
    for (const num of fulfilledNumber) {
      const prizeCode: string = 'FR' + num;

      if (await this.isRewardExists(userId, prizeCode)) {
        return;
      }
      if (relationshipNumber != Number(num)) {
        continue;
      }
      await this.createReward(userId, prizeCode);
      return this.getRewardResult(userId, prizeCode);
    }
  }

  private async getAllPrizeList() {
    return this.prizeRepository.find(
      {},
      { orderBy: { prize_code: QueryOrder.ASC } },
    );
  }

  private async getRewardListUserHave(user: User) {
    return this.rewardRepository.find({ user_id: user.id });
  }

  private async createReward(userId: string, prizeCode: string): Promise<void> {
    const reward: Reward = this.rewardRepository.create({
      user_id: userId,
      prize_code: prizeCode,
    });
    await this.rewardRepository.persistAndFlush(reward);
  }

  private async isRewardExists(userId: string, prizeCode: string) {
    const reward: Reward = await this.rewardRepository.findOne({
      user_id: userId,
      prize_code: prizeCode,
    });
    if (!reward) {
      return false;
    }
    return true;
  }

  private async getRewardResult(userId: string, prizeCode: string) {
    const result = await this.em.execute(`
    SELECT R.ID
         , R.USER_ID
         , R.CREATED_AT
         , P.PRIZE_CODE
         , P.NAME
         , P.ILLUST
      FROM REWARD R
     INNER JOIN PRIZE P
        ON P.PRIZE_CODE = R.PRIZE_CODE
     WHERE 1=1
       AND R.USER_ID = '${userId}'
       AND P.PRIZE_CODE = '${prizeCode}'
  `);
    return result;
  }

  private async getPrizeObjectWithUserOwned(
    prizes: Prize[],
    rewards: Reward[],
  ): Promise<any> {
    const userRewardOwnedList: PrizeUserOwnedDto[] = [];
    let rewardIdx = 0;

    for (const _ of prizes) {
      const {
        created_at: prizeCreateDate,
        updated_at: prizeUpdateDate,
        ...prize
      } = _;
      const reward: Reward = rewards[rewardIdx];

      const rewardData = {
        created_at: null,
        isOwned: false,
      };
      const prizeWithUserOwnedData: PrizeUserOwnedDto = {};
      if (
        rewardIdx < rewards.length &&
        prize.prize_code === reward.prize_code
      ) {
        rewardData.created_at = reward.created_at;
        rewardData.isOwned = true;
        rewardIdx++;
      }
      Object.assign(prizeWithUserOwnedData, prize, rewardData);
      userRewardOwnedList.push(prizeWithUserOwnedData);
    }

    return userRewardOwnedList;
  }

  private async getMaximumAnswerCount(userId: string): Promise<number> {
    const userBucketAnswerCount: any[] = await this.em.execute(`
      select a.bucket_id,
             count(a.*)
        from answer a
       inner join bucket b
          on b.id = a.bucket_id
       where b.user_id = '${userId}'
       group by a.bucket_id
    `);
    let maxAnswerCount = 0;
    for (const _ of userBucketAnswerCount) {
      if (maxAnswerCount < _.count) {
        maxAnswerCount = _.count;
      }
    }
    return maxAnswerCount;
  }
}
