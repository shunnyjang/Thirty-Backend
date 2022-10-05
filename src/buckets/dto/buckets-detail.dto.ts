import { ApiProperty } from '@nestjs/swagger';
import { Bucket } from 'src/entities';

class MissionAnswerDto {
  @ApiProperty({
    example: 2,
    type: `number`,
    description: `챌린지 미션 일수(번호)`,
    nullable: false,
  })
  date: Date;

  @ApiProperty({
    example: `챌린지를 시작해보자! "시작이 반이다"`,
    type: `string`,
    description: `미션 타이틀`,
  })
  mission: string;

  @ApiProperty({
    example: 1,
    description: `unique id`,
  })
  answerId: string;

  @ApiProperty({
    example: `https://youtu.be/Rrf8uQFvICE`,
    type: `string`,
    description: `음악 url`,
    nullable: true,
  })
  music?: string;

  @ApiProperty({
    example: `오늘 하루종일 들은 노래!`,
    type: `string`,
    description: `챌린지 답변 텍스트`,
    nullable: true,
  })
  detail?: string;

  @ApiProperty({
    example: `https://thirty-test-s3.s3.ap-northeast-2.amazonaws.com/test/166263694331248276168.jpeg`,
    type: `string`,
    description: `image url`,
    nullable: true,
  })
  image?: string;

  @ApiProperty({
    example: 3,
    type: `number`,
    description: `스탬프 id`,
    nullable: false,
  })
  stamp: number;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `등록 날짜`,
  })
  created_at: Date;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `수정 날짜`,
  })
  updated_at: Date;
}

export class BucketsDetail {
  @ApiProperty({
    type: Bucket,
  })
  bucket: Bucket;

  @ApiProperty({
    type: MissionAnswerDto,
    isArray: true,
  })
  answer: MissionAnswerDto[];
}
