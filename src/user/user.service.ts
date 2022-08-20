import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities';
import { compare, hash } from 'bcrypt';
import { UserTokenDto } from './dto/user-token.dto';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async createUser(uuid: string): Promise<User> {
    return this.userRepository.create({ uuid: uuid });
  }

  async getById(id: string): Promise<User> {
    return this.userRepository.findOne({ id: id });
  }

  async getByUuid(uuid: string): Promise<User> {
    return this.userRepository.findOne({ uuid: uuid });
  }

  async getByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email: email });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
    const isRefreshTokenMatching = await compare(
      refreshToken,
      user.refreshToken,
    );
    if (isRefreshTokenMatching) return user;
    throw new UnauthorizedException();
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await hash(refreshToken, 10);
    await this.userRepository.nativeUpdate(
      { id: userId },
      { refreshToken: currentHashedRefreshToken },
    );
  }

  private async removeRefreshToken(userId: string) {
    this.userRepository.nativeUpdate({ id: userId }, { refreshToken: null });
  }
}
