import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
}
