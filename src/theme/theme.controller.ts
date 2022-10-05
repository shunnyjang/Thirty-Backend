import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { BucketTheme } from 'src/entities';
import { ThemeService } from './theme.service';

@Controller('theme')
@ApiTags('Bucket Theme & Export')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('')
  @ApiOperation({ summary: `내보내기 테마 리스트 조회` })
  @ApiQuery({
    name: `name`,
    type: `string`,
    example: `키치`,
    description: `테마 필터 조건.없으면 전체 테마 목록`,
    required: false,
  })
  @ApiOkResponse({
    type: BucketTheme,
    isArray: true,
  })
  async getThemeList(@Query('name') name: string): Promise<BucketTheme[]> {
    return this.themeService.getThemeList(name);
  }

  @Get('/thumbnail')
  @ApiOperation({ summary: `테마 이름, 대표 프레임 url 목록` })
  @ApiOkResponse({
    schema: {
      items: {
        properties: {
          id: {
            type: `number`,
            example: 1,
            description: `unique id`,
          },
          name: {
            type: `string`,
            example: `키치`,
            description: `테마 이름`,
          },
          frame: {
            type: `string`,
            example: `https://aws.s3.com/themeimage.png`,
            description: `프레임 이미지 url`,
          },
        },
      },
    },
  })
  async getThemeThumbnailList() {
    return this.themeService.getThemeThumbnailList();
  }

  @Post('/export')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: `완료 챌린지 내보내기` })
  @ApiBody({
    schema: {
      properties: {
        bucket: {
          type: `string`,
          example: `55b7ca179d58c05154437021d3297a`,
          description: `내보낼 버킷 id`,
        },
        theme: {
          type: `number`,
          example: 1,
          description: `내보낼 테마의 unique id`,
        },
      },
    },
  })
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    schema: {
      properties: {
        statusCode: {
          type: `number`,
          example: 400,
        },
        message: {
          type: `string`,
          example: `완료되지 않은 챌린지는 내보낼 수 없습니다`,
        },
        error: {
          type: `string`,
          example: `Bad Request`,
        },
      },
    },
  })
  async exportBucketTheme(
    @Req() req,
    @Body('bucket') bucketId: string,
    @Body('theme') themeId: number,
  ) {
    return this.themeService.exportBucketTheme(req.user, bucketId, themeId);
  }
}
