import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

import { AuthService } from 'src/auth/auth.service';
import { ChallengeService } from 'src/challenge/challenge.service';
import { UserService } from 'src/user/user.service';
import { Answer, Bucket, Challenge, User } from 'src/entities';
import { UserTokenDto } from 'src/user/dto/user-token.dto';
import { BucketsDetail } from './dto/buckets-detail.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { CreateNewbieBucketDto } from './dto/create-newbie-buckets.dto';
import { BucketStatus } from './bucket-status.enum';
import { RewardService } from 'src/reward/reward.service';

@Injectable()
export class BucketsService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly challengeService: ChallengeService,
    private readonly em: EntityManager,
    @InjectRepository(Bucket)
    private readonly bucketRepository: EntityRepository<Bucket>,
    @InjectRepository(Answer)
    private readonly answerRepository: EntityRepository<Answer>,
  ) {}

  async createBucket(createBucketDto: CreateBucketDto): Promise<any> {
    const { user, challenge: challengeId } = createBucketDto;
    if (await this.isSameChallengeBucketWorkedOn(user, challengeId)) {
      throw new BadRequestException(`이미 진행 중인 챌린지 입니다.`);
    }

    const challenge: Challenge = await this.challengeService.getChallengeById(
      challengeId,
    );
    const bucket: Bucket = new Bucket(user, challenge);
    await this.bucketRepository.persistAndFlush(bucket);
    return bucket;
  }

  async createNewbieAndBucket(
    createNewbieBucketDto: CreateNewbieBucketDto,
  ): Promise<UserTokenDto> {
    const { uuid, challenge } = createNewbieBucketDto;

    const user: User = await this.userService.createUser(uuid);
    await this.createBucket({ user, challenge });

    const accessToken = this.authService.getCookieWithJwtAccessToken(user);
    return {
      access_token: accessToken.access_token,
      refresh_token: user.refreshToken,
    };
  }

  async getUserBucketList(
    user: User,
    status?: BucketStatus,
  ): Promise<Bucket[]> {
    if (!status) {
      return this.bucketRepository.find({
        user: { id: user.id },
      });
    }
    return this.bucketRepository.find({
      user: { id: user.id },
      status: status,
    });
  }

  async getBucketAndAnswersById(bucketId: string): Promise<any> {
    const bucket: Bucket = await this.getBucketById(bucketId);
    const answers = await this.em.execute(`
      select a.*
           , m.detail as mission
       from  answer a
       left  join bucket b
         on  b.id = a.bucket_id
       left  join challenge c
         on  c.id = b.challenge_id
       left  join mission m
         on  m.challenge_id = c.id
        and  m.date = a.date
    `);
    return {
      bucket: bucket,
      answers: answers,
    };
  }

  async createAnswer(
    user: User,
    bucketId: string,
    createAnswerDto: CreateAnswerDto,
    imageFileUrl?: string,
  ): Promise<any> {
    const bucket: Bucket = await this.getBucketById(bucketId);
    if (!bucket.isBucketWorkedOn()) {
      throw new BadRequestException(`종료된 챌린지 입니다.`);
    }

    Object.assign(createAnswerDto, {
      bucket: bucket,
      image: imageFileUrl,
    });
    let answer: Answer;
    try {
      answer = this.answerRepository.create(createAnswerDto);
      await this.answerRepository.persistAndFlush(answer);
    } catch (error) {
      // duplicate unique key
      console.log("error");
      console.log(error);
      if (error.code == 23505)
        throw new BadRequestException(`이미 진행한 챌린지 날짜 입니다.`);
    }

    bucket.count += 1;
    if (bucket.count === 30) {
      bucket.status = BucketStatus.COMPLETED;
      //TODO: Add Reward
      // Object.assign(answer, {reward: null});
    }
    this.bucketRepository.persistAndFlush(bucket);
    this.userService.checkUserAttendance(user);

    // if (bucket.count === 30) {
    //   const rewards = await this.rewardService.checkAndGetReward(user);
    //   Object.assign(answer, { rewards: rewards });
    // }

    return answer;
  }

  async getAnswerByBucketAndDate(
    bucketId: string,
    date: number,
  ): Promise<Answer> {
    return this.answerRepository.findOne({
      bucket: { id: bucketId },
      date: date,
    });
  }

  async updateBucketStatus(
    bucketId: string,
    status: BucketStatus,
  ): Promise<Bucket> {
    const bucket: Bucket = await this.getBucketById(bucketId);
    // TODO: 배포 때 활성화
    // if (!bucket.isPossibleToChangeBucketStatus()) {
    //   throw new BadRequestException(`이미 완료된 챌린지 입니다.`);
    // }
    bucket.status = status;
    await this.bucketRepository.persistAndFlush(bucket);
    return bucket;
  }

  private async getBucketById(id: string): Promise<Bucket> {
    const bucket = await this.bucketRepository.findOne(id);
    if (!bucket) {
      throw new BadRequestException(`존재하지 않는 챌린지 버킷 입니다.`);
    }
    return bucket;
  }

  private async isSameChallengeBucketWorkedOn(
    user: User,
    challengeId: number,
  ): Promise<boolean> {
    const bucket: Bucket[] | void = await this.bucketRepository.find({
      user: user,
      challenge: challengeId,
      status: BucketStatus.WORKING_ON,
    });

    if (bucket.length > 0) {
      return true;
    }
    return false;
  }
}
