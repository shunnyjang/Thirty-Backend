import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Notice } from 'src/entities';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Notice])],
  providers: [NoticeService],
  controllers: [NoticeController],
})
export class NoticeModule {}
