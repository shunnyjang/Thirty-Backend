import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { User } from 'src/entities';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiCookieAuth('Authentication')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  @ApiOperation({ summary: `프로필 조회` })
  @ApiResponse({
    status: 200,
    type: User,
  })
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req): Promise<any> {
    return this.userService.getUserProfileById(req.user);
  }

  @Patch('/profile')
  @ApiOperation({ summary: `유저 정보 수정` })
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
    type: User,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(req.user, updateUserDto);
  }

  @ApiOperation({ summary: `사용자 검색` })
  @ApiParam({
    name: `user_id`,
    type: `string`,
    example: `adfa8b368bcd91d3d830`,
    description: `user id`,
    required: true,
  })
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({})
  @Get('/:user_id')
  async findUser(@Param('user_id') userId: string) {
    return this.userService.getById(userId);
  }

  @Delete('/:uuid')
  deleteUser(@Param('uuid') uuid: string): Promise<void> {
    return this.userService.deleteUser(uuid);
  }
}
