import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { PushSchedule } from 'src/entities';
import { PushService } from './push.service';

@Module({
  imports: [MikroOrmModule.forFeature([PushSchedule])],
  exports: [PushService],
  providers: [PushService]
})
export class PushModule {}
