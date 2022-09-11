import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Answer, Bucket, User } from 'src/entities';
import { UserTokenDto } from 'src/user/dto/user-token.dto';
import { UserService } from 'src/user/user.service';
import { BucketStatus } from './bucket-status.enum';
import { BucketsDetail } from './dto/buckets-detail.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { CreateNewbieBucketDto } from './dto/create-newbie-buckets.dto';

@Injectable()
export class BucketsService {
  constructor(
    // private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectRepository(Bucket)
    private readonly bucketRepository: EntityRepository<Bucket>,
    private readonly userService: UserService,
    private readonly challengeService: ChallengeService,
    @InjectRepository(Answer)
    private readonly answerRepository: EntityRepository<Answer>,
  ) {}

  async createBucket(createBucketDto: CreateBucketDto): Promise<any> {
    const { user, challenge: challengeId } = createBucketDto;
    if (await this.isSameChallengeBucketWorkedOn(user, challengeId))
      throw new BadRequestException(`이미 진행 중인 챌린지 입니다.`);

    const challenge = await this.challengeService.getChallengeById(challengeId);
    const bucket = new Bucket(user, challenge);
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
    if (!status)
      return this.bucketRepository.find({
        user: { id: user.id },
      });

    return this.bucketRepository.find({
      user: { id: user.id },
      status: status,
    });
  }

  async getBucketById(bucketId: string): Promise<BucketsDetail> {
    const bucket = await this.findBucketById(bucketId);
    const answers = await this.answerRepository.find({
      bucket: { id: bucketId },
    });
    return {
      bucket: bucket,
      answers: answers,
    };
  }

  async createAnswer(
    bucketId: string,
    imageFileUrl: string,
    createAnswerDto: CreateAnswerDto,
  ): Promise<Answer> {
    const bucket = await this.findBucketById(bucketId);

    createAnswerDto.bucket = bucket;
    createAnswerDto.image = imageFileUrl;

    const answer = this.answerRepository.create(createAnswerDto);
    this.answerRepository.persistAndFlush(answer);

    bucket.count += 1;
    if (bucket.count > 30 || bucket.status !== BucketStatus.WORKING_ON)
      throw new BadRequestException(`종료된 챌린지 입니다.`);
    await this.bucketRepository.persistAndFlush(bucket);

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
    const bucket = await this.findBucketById(bucketId);
    // TODO: 배포 때 활성화
    // if (!this.isPossibleToChangeBucketStatus(bucket.status))
    //   throw new BadRequestException(`이미 완료된 챌린지 입니다.`);
    bucket.status = status;
    await this.bucketRepository.persistAndFlush(bucket);
    return bucket;
  }

  private async findBucketById(id: string) {
    try {
      return this.bucketRepository.findOneOrFail(id);
    } catch (error) {
      throw new BadRequestException(`존재하지 않는 챌린지 버킷입니다.`);
    }
  }

  private async isSameChallengeBucketWorkedOn(
    user: User,
    challengeId: number,
  ): Promise<boolean> {
    const bucket = await this.bucketRepository.find({
      user: user,
      challenge: challengeId,
      status: BucketStatus.WORKING_ON,
    });

    if (bucket.length > 0) return true;
    return false;
  }

  private isPossibleToChangeBucketStatus(oldStatus: BucketStatus) {
    if (oldStatus === BucketStatus.COMPLETED) return false;
  }
}
