import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Report extends BaseEntity {
  @Property({ nullable: false })
  userId: string;

  @Property({ nullable: false })
  targetUserId: string;

  @Property({
    comment: '신고 내용',
    nullable: true,
  })
  detail: string;
}
