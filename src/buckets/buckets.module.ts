import { Module } from '@nestjs/common';
import { Answer, Bucket, Challenge, User } from 'src/entities';
import { BucketsController } from './buckets.controller';
import { BucketsService } from './buckets.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CaslModule } from 'src/casl/casl.module';
import { ChallengeModule } from 'src/challenge/challenge.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Bucket, User, Challenge, Answer]),
    UserModule,
    BucketsModule,
    AuthModule,
    CaslModule,
    ChallengeModule,
  ],
  providers: [BucketsService],
  controllers: [BucketsController],
})
export class BucketsModule {}
