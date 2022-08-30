import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { User } from 'src/entities';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete('/:uuid')
  deleteUser(@Param('uuid') uuid: string): Promise<void> {
    return this.userService.deleteUser(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getUserProfile(@Req() req): Promise<any> {
    return this.userService.getById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/nickname')
  async modifyNickname(
    @Req() req,
    @Body('nickname') nickname: string,
  ): Promise<any> {
    return this.userService.modifyNickname(req.user, nickname);
  }
}
