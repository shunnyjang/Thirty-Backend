import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Category, Challenge, Mission } from 'src/entities';
import { ChallengeService } from './challenge.service';
import { CreateMissionDto } from './dto/create-mission.dto';

import {
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

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
