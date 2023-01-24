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
import { BlockService } from 'src/block/block.service';
import { CreateBlockDto } from 'src/block/dto/create-block.dto';

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
    private readonly blockService: BlockService,
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

    const isEmailDuplicated = await this.userRepository.findOne({
      email: userDataObject.email,
    });
    if (isEmailDuplicated) {
      throw new BadRequestException(`이미 가입한 이메일 입니다.`);
    }

    try {
      wrap(user).assign({
        ...userDataObject,
        password: await crypt.getHashedValue(password),
        signup_at: new Date(),
      });
      await this.userRepository.flush();
    } catch (error) {
      console.log(error.message);
    }

    return user;
  }

  async activateUser(user: User): Promise<boolean> {
    user.isSignedUp = true;
    await this.userRepository.flush();
    return true;
  }

  async getUserProfileById(user: User): Promise<any> {
    const { password, refreshToken, ...safeUserData } = user;
    const rewardCount = await this.rewardService.getRewardCountByUserId(
      user.id,
    );
    const completedChallengeCount =
      await this.bucketService.getCompletedChallengeBucketCount(user);
    const relationCount = await this.relationService.getRelationCountByUserId(
      user.id,
    );
    return {
      user: safeUserData,
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

  async update(user: User, updateUserDto: UpdateUserDto): Promise<any> {
    wrap(user).assign(updateUserDto);
    await this.userRepository.flush();
    const { refreshToken, password, ...safeUserData } = user;
    return {
      user: safeUserData,
      message: '사용자 정보 수정에 성공했습니다.',
    };
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

  async editPassword({ email, password }) {
    const user = await this.getByEmail(email);
    wrap(user).assign({
      password: await crypt.getHashedValue(password),
    });
    try {
      await this.userRepository.flush();
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException(
        `비밀번호 수정 실패, 관리자에게 문의하세요.`,
      );
    }

    const { refreshToken, password: _, ...safeUserData } = user;
    return safeUserData;
  }

  async report(
    user: User,
    createReportDto: CreateBlockDto,
  ): Promise<{ message: string }> {
    const isTargetUserExists: User = await this.getById(
      createReportDto.targetUserId,
    );

    createReportDto.userId = user.id;
    return this.blockService.report(createReportDto);
  }

  async block(user: User, targetUserId: string) {
    const isTargetUserExists: User = await this.getById(targetUserId);

    return this.blockService.block({
      userId: user.id,
      targetUserId: targetUserId,
    });
  }

  async unblock(user: User, targetUserId: string) {
    const isTargetUserExists: User = await this.getById(targetUserId);

    return this.blockService.unblock({
      userId: user.id,
      targetUserId: targetUserId,
    });
  }

  private async removeRefreshToken(user: User) {
    user.refreshToken = null;
    this.userRepository.persistAndFlush(user);
  }
}
