import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Notification } from 'src/entities';
import { RelationModule } from 'src/relation/relation.module';

@Module({
  imports: [
    forwardRef(() => RelationModule),
    MikroOrmModule.forFeature([Notification]),
  ],
  exports: [NotificationService],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
