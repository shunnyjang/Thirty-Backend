import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { LocalAuthGuard } from './guards/local-auth.guards';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthorizedUserDto } from 'src/user/dto/authorized-user.dto';
import { User } from 'src/entities';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: `회원가입` })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: `회원가입 성공`,
    type: User,
  })
  @Post('/signup')
  @UseGuards(JwtAuthGuard)
  async signup(@Req() req, @Body() registerUserDto: RegisterUserDto) {
    registerUserDto.user = req.user;
    return this.authService.signUp(registerUserDto);
  }

  @ApiOperation({ summary: `회원탈퇴` })
  @ApiResponse({
    status: 201,
    description: `회원탈퇴 성공, response body 없음`,
  })
  @Post('/signout')
  async signout(@Body('id') id: string): Promise<void> {
    return this.authService.signout(id);
  }

  @Post('/login')
  @ApiOperation({ summary: `로그인` })
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 201,
    description: `로그인 성공`,
    schema: {
      example: {
        access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYWJjZGVmdSIsImlkIjoiY2ZmNzQwN2E1MDQxYmU0MjE2MzciLCJpYXQiOjE2NjQ2MDg0NjMsImV4cCI6MTY2NTIxMzI2M30.emZbrLhdBwYROlxuZX13gc0gWc0Li1mM-22dV8ig3mc`,
      },
    },
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { access_token, ...options } =
      this.authService.getCookieWithJwtAccessToken(req.user);
    // res.setHeader(
    //   'Set-Cookie',
    //   cookie.serialize('Authentication', access_token, options),
    // );
    return {
      access_token: access_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/test')
  async test(@Req() req): Promise<any> {
    return req.user;
  }
}
