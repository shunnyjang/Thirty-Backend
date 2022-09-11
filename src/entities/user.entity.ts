import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Role } from '../user/user-role.enum';
import { UserVisiblity } from '../user/user-visibility.enum';

import * as crypto from 'crypto';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryKey({ autoincrement: false })
  id!: string;

  @Property({ unique: true })
  uuid: string;

  @Property({ nullable: true, unique: true })
  email: string;

  @Exclude()
  @Property({ nullable: true })
  password: string;

  @Property({ nullable: true })
  nickname: string;

  @Property({ defaultRaw: 'current_timestamp' })
  date_joined: Date = new Date();

  @Property({
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updated_at: Date = new Date();

  @Property({ type: 'string', default: Role.BASIC })
  role: Role;

  @Property({ type: 'string', default: UserVisiblity.PRIVATE })
  visibility: UserVisiblity;

  @Exclude()
  @Property({ nullable: true })
  refreshToken: string;

  @Property({ default: false })
  isSignedUp: boolean;

  @Exclude()
  @Property({
    nullable: true,
    hidden: true,
  })
  deleted_at: Date;

  constructor(uuid: string, token: string) {
    this.uuid = uuid;
    this.refreshToken = token;
    this.id = crypto.randomBytes(10).toString('hex');
  }
}

// @ManyToMany(() => Bucket, bucket => bucket.user, { hidden: true })
// buckets: new Collection<Bucket>(this);

// @OneToMany(() => User, user => user.friends, { hidden: true })
// friends: new Collection<User>(this);
