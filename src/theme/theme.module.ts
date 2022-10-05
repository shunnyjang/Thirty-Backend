import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { BucketsModule } from 'src/buckets/buckets.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BucketTheme, ExportLog } from 'src/entities';

@Module({
  imports: [BucketsModule, MikroOrmModule.forFeature([BucketTheme, ExportLog])],
  exports: [ThemeService],
  providers: [ThemeService],
  controllers: [ThemeController],
})
export class ThemeModule {}
