import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ExportLog {
  @PrimaryKey({ autoincrement: true })
  @Property()
  id: number;

  @Property({
    nullable: false,
  })
  userId: string;

  @Property({
    nullable: false,
  })
  bucketId: string;

  @Property({
    nullable: false,
  })
  themeId: number;

  @Property({ onCreate: () => new Date() })
  created_at: Date;

  constructor(userId: string, bucketId: string, themeId: number) {
    this.userId = userId;
    this.bucketId = bucketId;
    this.themeId = themeId;
  }
}
