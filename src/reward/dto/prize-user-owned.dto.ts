import { ApiProperty } from '@nestjs/swagger';

export class PrizeUserOwnedDto {
  id?: number;

  @ApiProperty({
    type: `string`,
    example: `CH01`,
    description: `prize own unique code`,
  })
  prize_code?: string;

  @ApiProperty({
    type: `string`,
    example: `시작이 반이다`,
    description: `리워드 이름`,
  })
  name?: string;

  @ApiProperty({
    type: `Date`,
    example: `2022-09-11T16:20:24.000Z`,
    description: `리워드 획득 시간 정보`,
  })
  created_at?: Date;

  @ApiProperty({
    type: `string`,
    example: `https://thirty-test-s3.s3.ap-northeast-2.amazonaws.com/test/1662636524777kindpng_4469807.png`,
    description: `리워드 일러스트 url`,
    nullable: true,
  })
  illust?: string;

  @ApiProperty({
    type: `boolean`,
    example: `true`,
    description: `리워드 보유 여부`,
  })
  isOwned?: boolean;
}
