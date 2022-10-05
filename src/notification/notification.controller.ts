import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { NotificationService } from './notification.service';
import { Notification } from '../entities';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: `알림 목록` })
  @ApiOkResponse({
    type: Notification,
    isArray: true,
  })
  @Get('')
  async getNotificationList(@Req() req): Promise<Notification[]> {
    return this.notificationService.getNotificationList(req.user);
  }

  @ApiOperation({ summary: `알림 읽음 처리` })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  @Post('/:notification_id')
  async checkReadNotification(
    @Req() req,
    @Param('notification_id') notificationId: number,
  ): Promise<void> {
    return this.notificationService.checkReadNotification(
      req.user,
      notificationId,
    );
  }
}
