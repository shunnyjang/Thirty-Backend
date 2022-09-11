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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
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
    const { user, ...userDataObject } = registerUserDto;

    userDataObject.password = await crypt.getHashedValue(
      registerUserDto.password,
    );
    Object.assign(userDataObject, {
      isSignedUp: true,
      signup_at: new Date(),
    });
    wrap(user).assign(userDataObject);
    this.userRepository.flush();

    return user;
  }

  async deleteUser(uuid: string): Promise<void> {
    const result = await this.userRepository.nativeDelete({ uuid: uuid });
    console.log(result);
  }

  async getById(id: string): Promise<any> {
    try {
      return this.userRepository.findOneOrFail({ id: id });
    } catch (error) {
      throw new BadRequestException(`존재하지 않는 사용자 입니다.`);
    }
  }

  async getByUuid(uuid: string): Promise<User> {
    try {
      return this.userRepository.findOneOrFail({ uuid: uuid });
    } catch (error) {
      throw new BadRequestException(`존재하지 않는 사용자 입니다.`);
    }
  }

  async getByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOneOrFail({ email: email });
    } catch (error) {
      throw new BadRequestException(`존재하지 않는 사용자 입니다.`);
    }
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

  private async removeRefreshToken(userId: string) {
    this.userRepository.nativeUpdate({ id: userId }, { refreshToken: null });
  }
}
