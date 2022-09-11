import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Bucket, Answer } from 'src/entities';
import { UserTokenDto } from 'src/user/dto/user-token.dto';
import { CreateNewbieBucketDto } from './dto/create-newbie-buckets.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { BucketsService } from './buckets.service';
import { BucketsDetail } from './dto/buckets-detail.dto';
import { BucketStatus } from './bucket-status.enum';
import { uploadFileOnAwsS3Bucket } from 'src/utils/file-upload';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Buckets')
@Controller('buckets')
export class BucketsController {
  constructor(private bucketsService: BucketsService) {}

  @ApiOperation({ summary: `새로운 회원 첫 버킷 생성` })
  @ApiBody({ type: CreateNewbieBucketDto })
  @ApiCreatedResponse({ type: UserTokenDto })
  @ApiBadRequestResponse({
    status: 400,
    schema: {
      properties: {
        statusCode: {
          type: `number`,
          example: 400,
        },
        message: {
          type: `string`,
          examples: [
            `존재하지 않는 챌린지 입니다.`,
            `이미 가입한 기록이 있습니다.`,
          ],
        },
        error: {
          type: `string`,
          example: `Bad Request`,
        },
      },
    },
  })
  @Post('/add/newbie')
  createNewbieAndBucket(
    @Body() createNewbieBucketDto: CreateNewbieBucketDto,
  ): Promise<UserTokenDto> {
    return this.bucketsService.createNewbieAndBucket(createNewbieBucketDto);
  }

  @ApiCookieAuth('Authentication')
  @ApiOperation({ summary: `기존 회원 버킷 생성` })
  @ApiBody({
    schema: {
      properties: {
        challenge: {
          type: `number`,
          example: 1,
          description: `추가할 챌린지 id`,
        },
      },
    },
  })
  @ApiCreatedResponse({ type: Bucket })
  @ApiBadRequestResponse({
    status: 400,
    schema: {
      properties: {
        statusCode: {
          type: `number`,
          example: 400,
        },
        message: {
          type: `string`,
          example: `존재하지 않는 챌린지 입니다.`,
        },
        error: {
          type: `string`,
          example: `Bad Request`,
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('/add/current')
  createExistingUserBucket(
    @Req() req,
    @Body('challenge') challenge: number,
  ): Promise<Bucket> {
    const user = req.user;
    return this.bucketsService.createBucket({ user, challenge });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: `유저의 챌린지 버킷 리스트` })
  @ApiQuery({
    name: `status`,
    type: `string`,
    enum: BucketStatus,
    enumName: `버킷 진행 상태`,
    required: false,
    description: `포함X:전체/WRK: 진행중/CMP:완료/ABD:중단`,
  })
  @ApiResponse({
    status: 200,
    description: `Return User's Challenge Bucket List`,
    type: Bucket,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUserBucketList(
    @Req() req,
    @Query('status') status?: BucketStatus,
  ): Promise<Bucket[]> {
    return this.bucketsService.getUserBucketList(req.user, status);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: `챌린지 버킷 상세 조회` })
  @ApiResponse({
    status: 200,
    description: `버킷 상세 조회`,
    type: BucketsDetail,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/:bucket_id')
  async getBucketById(
    @Param('bucket_id') bucketId: string,
  ): Promise<BucketsDetail> {
    return this.bucketsService.getBucketById(bucketId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: `답변 등록` })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAnswerDto })
  @ApiCreatedResponse({ type: Answer })
  @Post('/:bucket_id')
  @UseInterceptors(FileInterceptor('image'))
  async createAnswer(
    @Param('bucket_id') bucketId: string,
    @UploadedFile() imageFile,
    @Body() createAnswerDto: CreateAnswerDto,
  ): Promise<Answer> {
    const uploadedImageUrl = await uploadFileOnAwsS3Bucket(imageFile, 'test');
    return this.bucketsService.createAnswer(
      bucketId,
      uploadedImageUrl,
      createAnswerDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: `답변 상세 조회` })
  @ApiResponse({
    status: 200,
    type: Answer,
  })
  @Get('/:bucket_id/date/:date')
  @UseGuards(JwtAuthGuard)
  async getAnswerDetail(
    @Param('bucket_id') bucketId: string,
    @Param('date', ParseIntPipe) date: number,
  ): Promise<Answer> {
    return this.bucketsService.getAnswerByBucketAndDate(bucketId, date);
  }
}
