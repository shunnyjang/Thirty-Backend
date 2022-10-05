import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Relation } from 'src/entities';
import { RelationService } from './relation.service';
import { RelationController } from './relation.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule, MikroOrmModule.forFeature([Relation])],
  exports: [RelationService],
  providers: [RelationService],
  controllers: [RelationController],
})
export class RelationModule {}
