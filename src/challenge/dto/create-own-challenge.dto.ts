import { ApiProperty } from "@nestjs/swagger";
import { Category, Mission, User } from "src/entities";
import { CreateMissionDto } from "./create-mission.dto";

export class CreateChallengeDto {

    @ApiProperty({
        type: `string`,
        required: true,
        example: `공부 챌린지`,
        description: `챌린지 이름`,
    })
    title: string;

    @ApiProperty({
        type: `string`,
        required: false,
        example: `공부하기 싫을 때! 30일만 해보자`,
        description: `챌린지 설명`, 
    })
    description?: string;
    category?: Category;
    author?: User;
    is_public?: boolean;
    thumbnail?: string;
}

export class CreateOwnChallengeDto {
    @ApiProperty({
        type: CreateChallengeDto,
        required: true,
    })
    challenge: CreateChallengeDto;

    @ApiProperty({
        type: Mission,
        isArray: true,
        required: true,
    })
    missions: CreateMissionDto[];
}
