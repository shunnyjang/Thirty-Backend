import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class PushSchedule {
  @PrimaryKey()
  @Property()
  userId: string;

  @Property({ default: false })
  isPushOn: boolean;

  @Property({
    nullable: false,
    default: 'UTC+9',
  })
  timezone: string;

  @Property({
    length: 5,
    default: '10:00',
  })
  alarmAt: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
