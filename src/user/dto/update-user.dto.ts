import { ApiProperty } from '@nestjs/swagger';
import { UserVisiblity } from '../user-visibility.enum';

export class UpdateUserDto {
  @ApiProperty({
    type: `string`,
    description: `닉네임 수정`,
    example: `해리`,
  })
  nickname?: string;

  @ApiProperty({
    type: `string`,
    description: `나의 챌린지 공개 상태`,
    enum: UserVisiblity,
    example: `PRIVATE`,
  })
  visibility?: UserVisiblity;
}
