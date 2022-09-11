import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Challenge } from './challenges.entity';

import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Mission {
  @PrimaryKey({ hidden: true })
  id: number;

  @ManyToOne({
    hidden: true,
  })
  challenge: Challenge;

  @ApiProperty({
    example: 2,
    description: `미션 수행일 (순서)`,
  })
  @Property()
  date: number;

  @ApiProperty({
    example: `오늘의 야경을 찍어보자`,
    description: `미션 내용`,
  })
  @Property()
  detail: string;

  constructor(date: number, detail: string) {
    this.date = date;
    this.detail = detail;
  }
}
