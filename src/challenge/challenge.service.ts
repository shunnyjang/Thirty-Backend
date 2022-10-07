import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { BucketsService } from 'src/buckets/buckets.service';
import { Bucket, Category, Challenge, Mission, User } from 'src/entities';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CreateChallengeDto, CreateOwnChallengeDto } from './dto/create-own-challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: EntityRepository<Challenge>,
    @Inject(forwardRef(() => BucketsService))
    private readonly bucketsService: BucketsService,
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({});
  }

  async getChellengesByCategoryName(
    categoryName: string,
  ): Promise<Challenge[]> {
    return this.challengeRepository.find({
      category: {
        name: categoryName,
      },
      is_public: true,
    });
  }

  async getChallengeById(challengeId: number): Promise<Challenge> {
    try {
      const challenge = await this.challengeRepository.findOneOrFail(
        { id: challengeId },
        { populate: ['missions'] },
      );
      return challenge;
    } catch (e) {
      throw new BadRequestException(`존재하지 않는 챌린지 입니다.`);
    }
  }

  async registerChallengeMissions(
    missions: CreateMissionDto[],
    challengeId: number,
  ): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne(
      { id: challengeId },
      { populate: ['missions'] },
    );
    for (const mission of missions) {
      const { date, detail } = mission;
      const mission_ = new Mission(date, detail);
      challenge.missions.add(mission_);
      mission_.challenge = challenge;
    }
    await this.challengeRepository.persistAndFlush(challenge);
    return challenge;
  }

  async createOwnChallenge(
    user: User,
    createOwnChallengeDto: CreateOwnChallengeDto
  ): Promise<Bucket> {
    const { challenge: createChallengeDto, missions } = createOwnChallengeDto;

    // TODO: 배포 전 활성화
    // if (missions.length !== 30) {
    //   throw new BadRequestException(`미션 30일을 모두 채워야 등록 가능합니다.`);
    // }

    const category = await this.categoryRepository.findOne({ name: `UserOwnChallenge` });
    const challenge: Challenge = this.challengeRepository.create({
      ...createChallengeDto,
      category: category,
      is_public: false,
      author: user,
    });
    await this.challengeRepository.persistAndFlush(challenge);

    await this.registerChallengeMissions(
      missions,
      challenge.id,
    );

    return this.bucketsService.createBucket({
      user: user,
      challenge: challenge.id
    })
  }
}
