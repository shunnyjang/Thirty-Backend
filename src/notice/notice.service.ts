import { QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Notice, User } from 'src/entities';
import { CreateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: EntityRepository<Notice>,
  ) {}

  async getNoticeList(): Promise<Notice[]> {
    return this.noticeRepository.find(
      {},
      { orderBy: { created_at: QueryOrder.DESC } },
    );
  }

  async registerNewNotice(
    user: User,
    createNoticeDto: CreateNoticeDto,
  ): Promise<Notice> {
    createNoticeDto.writer_id = user.id;
    const notice = this.noticeRepository.create(createNoticeDto);
    this.noticeRepository.persistAndFlush(notice);
    return notice;
  }
}
