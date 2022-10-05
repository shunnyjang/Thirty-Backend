import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Notification } from 'src/entities';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MikroOrmModule.forFeature([Notification]),
  ],
  exports: [NotificationService],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
