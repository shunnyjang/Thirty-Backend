import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { CommunityService } from './community.service';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { CommunityResponse } from './community-response.type';

@ApiTags('Community')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @ApiOperation({ summary: `전체 커뮤니티 리스트 조회` })
  @ApiOkResponse({
    schema: {
      items: {
        allOf: [
          { $ref: getSchemaPath(CommunityResponse) },
          {
            properties: {
              isfriend: {
                type: `boolean`,
                example: `false`,
                description: `친구 여부`,
              },
            },
          },
        ],
      },
    },
    isArray: true,
  })
  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async getAllCommunityList(@Req() req): Promise<CommunityResponse[]> {
    return this.communityService.getAllCommunityList(req.user);
  }

  @ApiOperation({ summary: `친구 커뮤니티 리스트 조회` })
  @ApiOkResponse({
    type: CommunityResponse,
    isArray: true,
  })
  @Get('/Friend')
  @UseGuards(JwtAuthGuard)
  async getFriendCommunityList(@Req() req): Promise<CommunityResponse[]> {
    return this.communityService.getFriendCommunityList(req.user);
  }
}
