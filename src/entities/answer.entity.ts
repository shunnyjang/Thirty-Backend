import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './BaseEntity';
import { Bucket } from './buckets.entity';
import { getUrlOpenGraphData } from '../utils/open-graph';

@Entity()
@Unique({ properties: [`bucket`, `date`] })
export class Answer extends BaseEntity {
  @ManyToOne({
    entity: () => Bucket,
  })
  bucket: Bucket;

  @ApiProperty({
    example: `https://youtu.be/Rrf8uQFvICE`,
    type: `string`,
    description: `음악 url`,
    nullable: true,
  })
  @Property({ nullable: true })
  music: string;

  @ApiProperty({
    example: 2,
    type: `number`,
    description: `챌린지 미션 일수(번호)`,
    nullable: false,
  })
  @Property({ nullable: false })
  date: number;

  @ApiProperty({
    example: `오늘 하루종일 들은 노래!`,
    type: `string`,
    description: `챌린지 답변 텍스트`,
    nullable: true,
  })
  @Property({ nullable: true })
  detail: string;

  @ApiProperty({
    example: `https://thirty-test-s3.s3.ap-northeast-2.amazonaws.com/test/166263694331248276168.jpeg`,
    type: `string`,
    description: `image url`,
    nullable: true,
  })
  @Property({ nullable: true })
  image: string;

  @ApiProperty({
    example: 3,
    type: `number`,
    description: `스탬프 id`,
    nullable: false,
  })
  @Property({ nullable: false })
  stamp: number;

  @Property({
    default: false,
    hidden: true,
    comment: '사용자가 삭제한 답변인지 (초기화 실행)',
  })
  isDeleted: boolean;

  @ApiProperty({
    example: `챌린지를 시작해보자! "시작이 반이다"`,
    type: `string`,
    description: `미션 타이틀`,
  })
  mission: string;

  @ApiProperty({
    example: {
      url: 'https://www.youtube.com/watch?v=-E-_IRJU5w0',
      title: 'Conan Gray - Maniac (Official Video)',
      image: {
        url: 'https://i.ytimg.com/vi/-E-_IRJU5w0/maxresdefault.jpg',
        width: '1280',
        height: '720',
        type: 'jpg',
      },
    },
  })
  @Property({ persist: false })
  musicOpenGraph: object;
}
