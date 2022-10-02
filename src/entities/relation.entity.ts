import { Entity, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { RelationStatus } from 'src/relation/relation-stautus.enum';

import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Relation {
  @PrimaryKey()
  @Property({
    hidden: true,
    nullable: false,
  })
  userId: string;

  @PrimaryKey()
  @ApiProperty({
    example: 'adfa8b368bcd91d3d830',
    description: `친구 user unique id`,
  })
  @Property({
    nullable: false,
  })
  friendId: string;

  @ApiProperty({
    example: 'confirmed',
    description: `친구 관계 상태`,
    enum: RelationStatus,
  })
  @Property({ nullable: false, default: RelationStatus.PENDING })
  status: RelationStatus;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `관계 생성 날짜`,
    type: 'datetime',
  })
  @Property({ onCreate: () => new Date() })
  created_at: Date;

  [PrimaryKeyType]?: [string, string];

  constructor(userId: string, friendId: string) {
    this.userId = userId;
    this.friendId = friendId;
    this.status = RelationStatus.PENDING;
  }
}
