import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PushSchedule, User } from 'src/entities';

@Injectable()
export class PushService {
    constructor(
        @InjectRepository(PushSchedule)
        private readonly scheduleRepository: EntityRepository<PushSchedule>,
    ) {}

    async initUserSchedule(user: User): Promise<void> {
        const schedule = new PushSchedule(user.id);
        this.scheduleRepository.persistAndFlush(schedule);
    }
}
