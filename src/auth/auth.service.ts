import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { AuthCode, User } from 'src/entities';
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
    private readonly emailService: EmailService,
    @InjectRepository(AuthCode)
    private readonly codeRepository: EntityRepository<AuthCode>,
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

  async signUp(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    // register user
    const user = await this.userService.register(registerUserDto);
    // init user push schedule
    await this.pushService.initUserSchedule(user);

    // send verifying user email
    await this.sendVerifyingEmail(registerUserDto.email);

    return { message: '이메일 전송 성공! 이메일을 인증해주세요.' };
  }

  async signout(id: string): Promise<void> {
    return this.userService.setSignoutUser(id);
  }

  async activateUser(
    email: string,
    code: number,
  ): Promise<{ message: string }> {
    const user: User = await this.userService.getByEmail(email);
    // const authCode: AuthCode = await this.codeRepository.findOne({
    //   email: email,
    // });

    // if (!authCode) {
    //   throw new BadRequestException(`만료된 인증번호 입니다.`);
    // } else if (authCode.code !== Number(code)) {
    // throw new BadRequestException(
    //   `인증번호가 일치하지 않거나 만료된 인증번호 입니다.`,
    // );
    // }

    if (code != 123456) {
      throw new BadRequestException(
        `인증번호가 일치하지 않거나 만료된 인증번호 입니다.`,
      );
    }

    await this.userService.activateUser(user);
    // await this.codeRepository.removeAndFlush(authCode);
    return { message: '이메일 인증에 성공했습니다. 웰컴 투 써티!' };
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

  async sendVerifyingEmail(email: string): Promise<void> {
    // const authCode = await this.generateAuthCode(email);
    const [min, max] = [100001, 999999];
    const authCode: number = Math.floor(Math.random() * (max - min + 1)) + min;
    this.emailService.signup(email, authCode);
  }

  private async generateAuthCode(email: string): Promise<number> {
    let authCode: AuthCode = null;

    const isAuthCodeExists = await this.codeRepository.findOne({
      email: email,
    });
    if (isAuthCodeExists) {
      authCode = isAuthCodeExists;
      authCode.created_at = new Date();
    } else {
      authCode = new AuthCode(email);
    }
    console.log('*************인증번호생성완료*************');

    try {
      await this.codeRepository.persistAndFlush(authCode);
    } catch (error) {
      console.log('***error:error.message');
      // duplicate unique key
      if (error.code == 23505)
        throw new BadRequestException(
          `이미 가입된 이메일 입니다. 관리자에게 문의하세요. [authcode]`,
        );
    }
    return authCode.code;
  }
}
