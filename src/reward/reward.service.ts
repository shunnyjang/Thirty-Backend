import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Prize, Reward, User } from 'src/entities';
import { PrizeUserOwnedDto } from './dto/prize-user-owned.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: EntityRepository<Reward>,
    @InjectRepository(Prize)
    private readonly prizeRepository: EntityRepository<Prize>,
  ) {}

  async getUserRewardsList(user: User): Promise<PrizeUserOwnedDto[]> {
    const allPrizeList: Prize[] = await this.getAllPrizeList();
    const rewardsListUserHave: Reward[] = await this.getRewardListUserHave(
      user,
    );
    return this.getPrizeObjectWithUserOwned(allPrizeList, rewardsListUserHave);
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
}
