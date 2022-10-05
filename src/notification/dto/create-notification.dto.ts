import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto {
  userId: string;
  relatedUserId: string;
  type: NotificationType;
  sourceName?: string;
  sourceId?: string | number;
}
