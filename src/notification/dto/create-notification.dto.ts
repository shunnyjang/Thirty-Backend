import { User } from 'src/entities';
import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto<T extends User | string> {
  user: T;
  relatedUser: T;
  type: NotificationType;
  sourceName?: string;
  sourceId?: string | number;
}
