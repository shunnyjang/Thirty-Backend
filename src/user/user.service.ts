import { EntityRepository } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities';
import { InjectRepository } from '@mikro-orm/nestjs';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { crypt } from 'src/utils/crypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { wrap } from '@mikro-orm/core';
import { RewardService } from 'src/reward/reward.service';
import { BucketsService } from 'src/buckets/buckets.service';
import { RelationService } from 'src/relation/relation.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly rewardService: RewardService,
    @Inject(forwardRef(() => BucketsService))
    private readonly bucketService: BucketsService,
    private readonly relationService: RelationService,
  ) {}

  async createUser(uuid: string): Promise<User> {
    const refreshToken = this.authService.getRefreshToken(uuid);
    try {
      const user = new User(uuid, refreshToken);
      await this.userRepository.persistAndFlush(user);
      return user;
    } catch (error) {
      // duplicate unique key
      if (error.code == 23505)
        throw new BadRequestException(`이미 가입한 기록이 있습니다.`);
      throw new BadRequestException(`가입할 수 없습니다`);
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { user, password, ...userDataObject } = registerUserDto;

    try {
      wrap(user).assign({
        ...userDataObject,
        password: await crypt.getHashedValue(password),
        signup_at: new Date(),
      });
      await this.userRepository.flush();
    } catch (error) {
      // duplicate unique key
      if (error.code == 23505)
        throw new BadRequestException(`이미 가입한 이메일 입니다.`);
    }

    return user;
  }

  async activateUser(user: User): Promise<boolean> {
    user.isSignedUp = true;
    await this.userRepository.flush();
    return true;
  }

  async getUserProfileById(id: string): Promise<any> {
    const user = await this.getById(id);
    const rewardCount = await this.rewardService.getRewardCountByUserId(id);
    const completedChallengeCount =
      await this.bucketService.getCompletedChallengeBucketCount(user);
    const relationCount = await this.relationService.getRelationCount(id);
    return {
      user: user,
      rewardCount: rewardCount,
      completedChallengeCount: completedChallengeCount,
      relationCount: relationCount,
    };
  }

  async deleteUser(uuid: string): Promise<void> {
    const result = await this.userRepository.nativeDelete({ uuid: uuid });
    console.log(result);
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id: id });
    if (user) {
      return user;
    }
    throw new BadRequestException(`존재하지 않는 사용자 입니다.`);
  }

  async getByUuid(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({ uuid: uuid });
    if (user) {
      return user;
    }
    throw new BadRequestException(`존재하지 않는 사용자 입니다.`);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email: email });
    if (user) {
      return user;
    }
    throw new BadRequestException(
      `존재하지 않는 아이디 혹은 비밀번호가 맞지 않습니다.`,
    );
  }

  async update(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    wrap(user).assign(updateUserDto);
    this.userRepository.flush();
    return user;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
    if (crypt.isEqualToHashed(refreshToken, user.refreshToken)) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await crypt.getHashedValue(refreshToken);
    await this.userRepository.nativeUpdate(
      { id: userId },
      { refreshToken: currentHashedRefreshToken },
    );
  }

  async setSignoutUser(id: string): Promise<void> {
    await this.userRepository.nativeUpdate(
      { id: id },
      { deleted_at: new Date() },
    );
  }

  async checkUserAttendance(user: User): Promise<void> {
    user.continuous_attendance += 1;
    this.userRepository.persistAndFlush(user);
  }

  private async removeRefreshToken(user: User) {
    user.refreshToken = null;
    this.userRepository.persistAndFlush(user);
  }
}
