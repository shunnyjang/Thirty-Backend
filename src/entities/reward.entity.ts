import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity()
@Unique({ properties: ['user_id', 'prize_code'] })
export class Reward extends BaseEntity {
  @Property()
  user_id: string;

  @Property()
  prize_code: string;

  constructor(user_id: string, prize_code: string) {
    super();
    this.user_id = user_id;
    this.prize_code = prize_code;
  }
}
