import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities';
import { PushService } from 'src/push/push.service';
import { UserService } from 'src/user/user.service';
import { crypt } from 'src/utils/crypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { TokenPayload } from './payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly pushService: PushService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getByEmail(email);
    if (!user) return null;

    const isPasswordRight = await crypt.isEqualToHashed(
      password,
      user.password,
    );
    if (!isPasswordRight) {
      return null;
    }
    return user;
  }

  async signUp(registerUserDto: RegisterUserDto): Promise<User> {
    const user = await this.userService.register(registerUserDto);
    this.pushService.initUserSchedule(user);
    return user;
  }

  async signout(id: string): Promise<void> {
    return this.userService.setSignoutUser(id);
  }

  async generateAccessToken(user: User) {
    const { uuid, id } = user;
    const payload: TokenPayload = { uuid: uuid, id: id };
    return { access_token: this.jwtService.sign(payload) };
  }

  getCookieWithJwtAccessToken(user: User) {
    const { uuid, id } = user;
    const payload: TokenPayload = { uuid: uuid, id: id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    return {
      access_token: token,
      domain: this.configService.get('HOST_NAME'),
      path: '/',
      httpOnly: true,
      'max-age':
        Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')) * 1000,
    };
  }

  getRefreshToken(uuid: string) {
    const payload = { uuid };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  getCookiesForLogOut() {
    return {
      accessOptions: {
        domain: this.configService.get('HOST_NAME'),
        path: '/',
        httpOnly: true,
        'max-age': 0,
      },
      refreshOptions: {
        domain: this.configService.get('HOST_NAME'),
        path: '/',
        httpOnly: true,
        'max-age': 0,
      },
    };
  }
}
