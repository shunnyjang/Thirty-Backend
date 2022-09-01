import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../user-type.enum';
import { UserVisiblity } from '../user-visibility.enum';

export class AuthorizedUserDto {
  @ApiProperty({
    example: `adfa8b368bcd91d3d830`,
    description: `user unique id`,
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: `user device uuid`,
    type: `string`,
  })
  uuid: string;

  @ApiProperty({
    example: `example@thirty.com`,
    description: `이메일`,
    type: 'string',
  })
  email: string;

  @ApiProperty({
    example: `해리`,
    description: `닉네임`,
    type: 'string',
  })
  nickname: string;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `첫 버킷 생성 날짜`,
    type: 'datetime',
  })
  date_joined: Date;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `최근 정보 업데이트 날짜`,
    type: `datetime`,
  })
  updated_at: Date;

  @ApiProperty({
    example: `BASIC`,
    enum: UserType,
    description: `유저 타입`,
  })
  type: UserType;

  @ApiProperty({
    example: `PUBLIC`,
    enum: UserVisiblity,
    description: `챌린지 공개 여부`,
  })
  visibility: UserVisiblity;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `탈퇴 처리 날짜`,
    type: `datetime`,
  })
  deleted_at: Date;
}
