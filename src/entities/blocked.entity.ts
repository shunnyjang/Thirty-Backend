import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './BaseEntity';
import { User } from './user.entity';

@Entity()
export class Blocked extends BaseEntity {
  @Property()
  userId: string;

  @Property({ hidden: true })
  targetUserId: string;

  @ApiProperty({
    type: () => {
      return {
        targetUser: {
          type: `object`,
          properties: {
            id: {
              type: `string`,
              description: `차단한 사용자 id`,
            },
            nickname: {
              type: `string`,
              description: `차단한 사용자 nickname`,
            },
          },
        },
      };
    },
  })
  @ManyToOne({
    entity: () => User,
    joinColumn: `target_user_id`,
    referenceColumnName: `id`,
    serializer: (value) => {
      return {
        id: value.id,
        nickname: value.nickname,
      };
    },
    persist: false,
    eager: true,
  })
  targetUser: User;
}
