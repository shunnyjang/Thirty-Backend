import { ApiProperty } from '@nestjs/swagger';
import { RelationStatus } from '../relation-stautus.enum';

export class CreateResponseRSVPDto {
  @ApiProperty({
    example: `adfa8b368bcd91d3d830`,
    description: `상대 user unique id`,
    type: 'string',
  })
  friendId: string;

  @ApiProperty({
    example: `confirmed`,
    type: 'string',
    enum: ['confirmed', 'denied'],
  })
  status: RelationStatus;
}
