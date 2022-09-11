import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity, Category, Mission, User } from '../entities';

import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Challenge extends BaseEntity {
  @ApiProperty({ example: '사진찍기', description: '챌린지 제목' })
  @Property()
  title: string;

  @ApiProperty({
    example: '30일동안 사진 찍기 해봐요!',
    description: '챌린지 설명',
  })
  @Property()
  description: string;

  @ApiProperty({ example: true, description: '챌린지 템플릿 공유 여부' })
  @Property({ default: true })
  is_public: boolean;

  @ApiProperty({
    type: () => Category,
  })
  @ManyToOne({
    entity: () => Category,
    onDelete: 'cascade',
    eager: true,
  })
  category: Category;

  @ApiProperty({
    type: () => User,
  })
  @ManyToOne({
    entity: () => User,
    nullable: true,
  })
  author: User;

  @ApiProperty({
    example: `https://thirty-test-s3.s3.ap-northeast-2.amazonaws.com/test/166263694331248276168.jpeg`,
    type: `string`,
    description: `thumbnail image url`,
    nullable: true,
  })
  @Property({ nullable: true })
  thumbnail: string;

  @ApiProperty({
    type: () => Mission,
  })
  @OneToMany(() => Mission, (m) => m.challenge)
  missions = new Collection<Mission>(this);
}
