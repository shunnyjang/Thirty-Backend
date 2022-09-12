import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { Notice } from 'src/entities';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticeService } from './notice.service';

@Controller('notice')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('')
  async getNoticeList(): Promise<Notice[]> {
    return this.noticeService.getNoticeList();
  }

  //TODO: Permission Role Only Admin
  @Post('')
  async registerNewNotice(
    @Req() req,
    @Body() createNoticeDto: CreateNoticeDto,
  ) {
    return this.noticeService.registerNewNotice(req.user, createNoticeDto);
  }
}
