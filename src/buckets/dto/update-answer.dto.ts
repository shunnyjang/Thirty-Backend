import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnswerDto {
  @ApiProperty({
    type: `file`,
    format: `binary`,
    description: `이미지 파일`,
    required: false,
  })
  image?: string;

  @ApiProperty({
    type: `string`,
    example: `https://youtu.be/Rrf8uQFvICE`,
    description: `음악 유튜브 url`,
    required: false,
  })
  music?: string;

  @ApiProperty({
    type: `string`,
    example: `오늘 하루종일 들은 노래!`,
    description: `챌린지 답변 텍스트`,
    required: false,
  })
  detail?: string;

  @ApiProperty({
    example: 3,
    type: `number`,
    description: `스탬프 id`,
    required: true,
  })
  stamp: number;
}
