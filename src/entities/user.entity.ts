import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Role } from '../user/user-role.enum';
import { UserVisiblity } from '../user/user-visibility.enum';

import * as crypto from 'crypto';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    example: `adfa8b368bcd91d3d830`,
    description: `user unique id`,
    type: 'string',
  })
  @PrimaryKey({ autoincrement: false })
  id!: string;

  @ApiProperty({
    example: `4147CD3E-8820-436C-81F6-1AFBBB079D1D`,
    description: `user device uuid`,
    type: `string`,
  })
  @Property({ unique: true })
  uuid: string;

  @ApiProperty({
    example: `example@thirty.com`,
    description: `이메일`,
    type: 'string',
  })
  @Property({ nullable: true, unique: true })
  email: string;

  @Exclude()
  @Property({ nullable: true })
  password: string;

  @ApiProperty({
    example: `해리`,
    description: `닉네임`,
    type: 'string',
  })
  @Property({ nullable: true })
  nickname: string;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `첫 버킷 생성 날짜`,
    type: 'datetime',
  })
  @Property({ defaultRaw: 'current_timestamp' })
  date_joined: Date = new Date();

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `최근 정보 업데이트 날짜`,
    type: `datetime`,
  })
  @Property({
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updated_at: Date = new Date();

  @ApiProperty({
    example: `BASIC`,
    enum: Role,
    description: `유저 타입`,
  })
  @Property({ type: 'string', default: Role.BASIC })
  role: Role;

  @ApiProperty({
    example: `PUBLIC`,
    enum: UserVisiblity,
    description: `챌린지 공개 여부`,
  })
  @Property({ type: 'string', default: UserVisiblity.PRIVATE })
  visibility: UserVisiblity;

  @Exclude()
  @Property({ nullable: true })
  refreshToken: string;

  @ApiProperty({
    type: `boolean`,
    example: false,
    description: `회원 가입 여부`,
  })
  @Property({ default: false })
  isSignedUp: boolean;

  @Exclude()
  @Property({ nullable: true })
  signup_at: Date;

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
