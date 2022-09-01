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
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { AuthorizedUserDto } from './dto/authorized-user.dto';
import { UserService } from './user.service';

@ApiCookieAuth('Authentication')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete('/:uuid')
  deleteUser(@Param('uuid') uuid: string): Promise<void> {
    return this.userService.deleteUser(uuid);
  }

  @ApiOperation({ summary: `프로필 조회` })
  @ApiResponse({
    status: 200,
    type: AuthorizedUserDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getUserProfile(@Req() req): Promise<AuthorizedUserDto> {
    return this.userService.getById(req.user.id);
  }

  @ApiOperation({ summary: `닉네임 수정` })
  @ApiBody({
    schema: {
      properties: {
        nickname: {
          type: `string`,
          example: `해리`,
          description: `수정할 닉네임`,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    type: AuthorizedUserDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('/profile/nickname')
  async modifyNickname(
    @Req() req,
    @Body('nickname') nickname: string,
  ): Promise<any> {
    return this.userService.modifyNickname(req.user, nickname);
  }
}
