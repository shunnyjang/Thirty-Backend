import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { Notice } from 'src/entities';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticeService } from './notice.service';

@ApiTags('Notice')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@Controller('notice')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiOperation({ summary: `공지사항 목록 조회` })
  @ApiResponse({
    status: 200,
    type: Notice,
    isArray: true,
  })
  @Get('')
  async getNoticeList(): Promise<Notice[]> {
    return this.noticeService.getNoticeList();
  }

  //TODO: Permission Role Only Admin
  @ApiOperation({ summary: `공지사항 작성 (admin only)` })
  @ApiBody({
    schema: {
      properties: {
        detail: {
          type: `string`,
          format: `text`,
          description: `공지사항 내용`,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    type: Notice,
  })
  @Post('')
  async registerNewNotice(
    @Req() req,
    @Body() createNoticeDto: CreateNoticeDto,
  ): Promise<Notice> {
    return this.noticeService.registerNewNotice(req.user, createNoticeDto);
  }
}
