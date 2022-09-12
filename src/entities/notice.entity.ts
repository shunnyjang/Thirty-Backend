import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Notice {
  @PrimaryKey({ autoincrement: true })
  @Property()
  id: number;

  @Property()
  detail: string;

  @Property()
  writer_id: string;

  @Property({ onCreate: () => new Date() })
  created_at: Date;

  @Property({ onUpdate: () => new Date() })
  updated_at: Date;
}
