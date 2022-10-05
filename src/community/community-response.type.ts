import { ApiProperty } from '@nestjs/swagger';

export class CommunityResponse {
  @ApiProperty({
    example: 1,
    description: `answer unique id`,
  })
  answerId: number;

  @ApiProperty({
    example: 1,
    description: `bucket unique id`,
  })
  bucketId: number;

  @ApiProperty({
    example: `adfa8b368bcd91d3d830`,
    description: `user unique id`,
  })
  userId: string;

  @ApiProperty({
    example: `해리`,
    description: `닉네임`,
    type: 'string',
  })
  nickname: string;

  @ApiProperty({ example: '사진찍기', description: '챌린지 제목' })
  challenge: string;

  @ApiProperty({
    example: `오늘의 야경을 찍어보자`,
    description: `미션 내용`,
  })
  mission: string;

  @ApiProperty({
    example: 2,
    description: `미션 수행일 (순서)`,
  })
  date: number;

  @ApiProperty({
    example: `https://thirty-test-s3.s3.ap-northeast-2.amazonaws.com/test/166263694331248276168.jpeg`,
    type: `string`,
    description: `image url`,
    nullable: true,
  })
  image: string;

  @ApiProperty({
    example: `오늘 하루종일 들은 노래!`,
    type: `string`,
    description: `챌린지 답변 텍스트`,
    nullable: true,
  })
  detail: string;

  @ApiProperty({
    example: `https://youtu.be/Rrf8uQFvICE`,
    type: `string`,
    description: `음악 url`,
    nullable: true,
  })
  music: string;

  @ApiProperty({
    example: 3,
    type: `number`,
    description: `스탬프 id`,
    nullable: false,
  })
  stamp: string;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `등록 날짜`,
  })
  created_at: Date;
}
