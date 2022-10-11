import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import {
  NotificationType,
  NotificationTypeCode,
} from 'src/notification/notification-type.enum';
import { BaseEntity } from './BaseEntity';
import { User } from './user.entity';

@Entity()
export class Notification extends BaseEntity {
  @ApiProperty({
    example: `adfa8b368bcd91d3d830`,
    description: `user unique id`,
    type: 'string',
  })
  @Property({ hidden: true, fieldName: `user_id` })
  userId: string;

  @ApiProperty({
    example: `abcdefgt1234`,
    description: `관련 user unique id`,
    type: 'string',
  })
  @Property({ nullable: true })
  relatedUserId: string;

  @ApiProperty({
    example: `해리`,
    description: `user nickname`,
    type: 'string',
  })
  @ManyToOne({
    entity: () => User,
    joinColumn: `related_user_id`,
    referenceColumnName: `id`,
    eager: true,
    persist: false,
    serializer: (value) => value.nickname,
  })
  relatedUserNickname: User;

  @ApiProperty({
    type: `string`,
    enum: NotificationTypeCode,
    description: `알림 종류\n`,
  })
  @Property()
  type: NotificationType;

  @ApiProperty({
    type: `string`,
    description: ``,
  })
  @Property({ nullable: true })
  message: string;

  @Property({ nullable: true })
  relatedSourceName: string;

  @Property({ nullable: true })
  relatedSourceId: string | number;

  @ApiProperty({
    type: `boolean`,
    example: false,
    description: ``,
  })
  @Property({ default: false })
  is_read: boolean;

  constructor(createNotificationDto: CreateNotificationDto) {
    super();
    const { userId, type, relatedUserId, sourceName, sourceId } =
      createNotificationDto;
    this.userId = userId;
    this.type = type;
    this.message = this.getNotificationMessage(type);

    if (relatedUserId) {
      this.relatedUserId = relatedUserId;
    }
    if (sourceName && sourceId) {
      this.relatedSourceName = sourceName;
      this.relatedSourceId = sourceId;
    }
  }

  setNotificationMessage(notiType: NotificationType, challengeName?: string) {
    this.message = this.getNotificationMessage(notiType, challengeName);
  }

  private getNotificationMessage(
    notiType: NotificationType,
    relatedUserChallangeName?: string,
  ) {
    return {
      RR0: `님이 친구 신청을 했어요.`,
      RR1: `님의 친구 신청을 수락했어요.`,
      RR2: `님의 친구 신청을 거절했어요.`,
      RC0: `님이 회원님의 친구 신청을 수락했어요.`,
      BC0: `님이 '${relatedUserChallangeName}' 챌린지를 성공했어요!`,
      BA0: `님이 '${relatedUserChallangeName}' 답변을 작성했어요.`,
    }[notiType];
  }
}
