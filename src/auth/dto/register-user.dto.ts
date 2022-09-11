import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities';

export class RegisterUserDto {
  user?: User;

  @ApiProperty({
    example: `example@thirty.com`,
    description: `이메일`,
    type: 'string',
  })
  email: string;

  @ApiProperty({
    example: `password1`,
    description: `비밀번호`,
    type: 'string',
  })
  password: string;

  @ApiProperty({
    example: `해리`,
    description: `닉네임`,
    type: 'string',
  })
  nickname: string;

  isSignedUp?: boolean;
  signup_at?: Date;
}
