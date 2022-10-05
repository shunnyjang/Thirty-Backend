import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { User } from 'src/entities';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RewardModule } from 'src/reward/reward.module';
import { BucketsModule } from 'src/buckets/buckets.module';
import { RelationModule } from 'src/relation/relation.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RewardModule,
    forwardRef(() => BucketsModule),
    RelationModule,
    MikroOrmModule.forFeature([User]),
  ],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
