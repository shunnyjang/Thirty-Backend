import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities';
import { InjectRepository } from '@mikro-orm/nestjs';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { crypt } from 'src/utils/crypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthorizedUserDto } from './dto/authorized-user.dto';
import { nextTick } from 'process';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async createUser(uuid: string): Promise<User> {
    const user = this.userRepository.create({ uuid: uuid });
    await this.transaction(user);
    return user;
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { id, password, password_repeat, email } = registerUserDto;
    const hashedPassword = await crypt.getHashedValue(password);
    await this.userRepository.nativeUpdate(
      { id: id },
      { email: email, password: hashedPassword },
    );
    return this.getById(id);
  }

  async deleteUser(uuid: string): Promise<void> {
    const result = await this.userRepository.nativeDelete({ uuid: uuid });
    console.log(result);
  }

  async getById(id: string): Promise<any> {
    const { password, refreshToken, ...user } =
      await this.userRepository.findOne({ id: id });
    return user;
  }

  async getByUuid(uuid: string): Promise<User> {
    return this.userRepository.findOne({ uuid: uuid });
  }

  async getByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email: email });
  }

  async update(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthorizedUserDto> {
    await this.userRepository.nativeUpdate({ id: user.id }, updateUserDto);
    if (updateUserDto.nickname) user.nickname = updateUserDto.nickname;
    if (updateUserDto.visibility) user.visibility = updateUserDto.visibility;
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
    if (crypt.isEqualToHashed(refreshToken, user.refreshToken)) return user;
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

  private async transaction(user: User) {
    this.userRepository.persist(user);
  }
}
