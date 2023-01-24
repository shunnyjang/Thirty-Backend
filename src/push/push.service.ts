import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
import { PushSchedule, User } from 'src/entities';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(PushSchedule)
    private readonly scheduleRepository: EntityRepository<PushSchedule>,
  ) {}

  async initUserSchedule(user: User): Promise<void> {
    const schedule = new PushSchedule(user.id);
    try {
      await this.scheduleRepository.persistAndFlush(schedule);
    } catch (error) {
      // duplicate unique key
      if (error.code == 23505)
        throw new BadRequestException(
          `이미 가입한 기록이 있습니다. 관리자에게 문의하세요. [push schedule]`,
        );
    }
  }
}
