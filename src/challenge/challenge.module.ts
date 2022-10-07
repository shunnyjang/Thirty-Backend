import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { BucketsModule } from 'src/buckets/buckets.module';
import { Category, Challenge, Mission } from 'src/entities';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';

@Module({
  imports: [
    forwardRef(() => BucketsModule),
    MikroOrmModule.forFeature([Category, Challenge, Mission])
  ],
  exports: [ChallengeService],
  controllers: [ChallengeController],
  providers: [ChallengeService],
})
export class ChallengeModule {}
