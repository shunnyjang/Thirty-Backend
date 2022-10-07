import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Bucket, Category, Challenge, Mission } from 'src/entities';
import { ChallengeService } from './challenge.service';
import { CreateMissionDto } from './dto/create-mission.dto';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AnonymousGuard, JwtAuthGuard } from 'src/auth/guards';
import { CreateOwnChallengeDto } from './dto/create-own-challenge.dto';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengeController {
  constructor(private challengeService: ChallengeService) {}

  @ApiOperation({ summary: `카테고리 조회` })
  @ApiResponse({
    status: 200,
    description: `Return Categories`,
    type: Category,
    isArray: true,
  })
  @Get('')
  getAllCategories(): Promise<Category[]> {
    return this.challengeService.getAllCategories();
  }

  @ApiOperation({ summary: `나만의 챌린지 생성` })
  @ApiBearerAuth()
  @ApiBody({ type: CreateOwnChallengeDto })
  @ApiCreatedResponse({ type: Bucket })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: `미션 30일을 모두 채워야 등록 가능합니다.`,
        error: `Bad Request`,
      }
    }
  })
  @Post('')
  @UseGuards(JwtAuthGuard)
  createOwnChallenge(
    @Req() req,
    @Body() createOwnChallengeDto: CreateOwnChallengeDto
  ): Promise<Bucket> {
    return this.challengeService.createOwnChallenge(req.user, createOwnChallengeDto);
  }

  @ApiOperation({ summary: `카테고리 내 챌린지 목록 조회` })
  @ApiResponse({
    status: 200,
    description: `Return Challenges Of Category`,
    type: Challenge,
    isArray: true,
  })
  @Get('/:category')
  getChallengeByName(
    @Param('category') categoryName: string,
  ): Promise<Challenge[]> {
    return this.challengeService.getChellengesByCategoryName(categoryName);
  }

  @ApiOperation({ summary: `챌린지 상세 조회` })
  @ApiExtraModels(Mission)
  @ApiResponse({
    status: 200,
    description: `Return Challenge Detail`,
    schema: {
      allOf: [
        { $ref: getSchemaPath(Challenge) },
        {
          properties: {
            missions: {
              type: 'array',
              items: { $ref: getSchemaPath(Mission) },
            },
          },
        },
      ],
    },
  })
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
  @Get('/:category/:id')
  getQuestionsByChallengeId(
    @Param('id', ParseIntPipe) challengeId: number,
  ): Promise<Challenge> {
    return this.challengeService.getChallengeById(challengeId);
  }

  @ApiExcludeEndpoint()
  @Post('/:category/:id')
  registerChallengeMissions(
    @Param('id', ParseIntPipe) challengeId: number,
    @Body('missions') missions: CreateMissionDto[],
  ): Promise<Challenge> {
    console.log('missions', missions);
    return this.challengeService.registerChallengeMissions(
      missions,
      challengeId,
    );
  }
}
