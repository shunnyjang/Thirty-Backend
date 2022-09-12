import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Notice {
  @ApiProperty({
    type: `number`,
    example: `1`,
    description: `notice unique key`,
  })
  @PrimaryKey({ autoincrement: true })
  @Property()
  id: number;

  @ApiProperty({
    type: `string`,
    format: `text`,
    description: `공지사항 내용`,
  })
  @Property()
  detail: string;

  @ApiProperty({
    type: `string`,
    description: `공지사항 작성자 id`,
  })
  @Property()
  writer_id: string;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `등록 날짜`,
  })
  @Property({
    defaultRaw: 'current_timestamp',
    onCreate: () => new Date(),
  })
  created_at: Date;

  @ApiProperty({
    example: `2022-08-25T00:56:47.000Z`,
    description: `수정 날짜`,
  })
  @Property({
    defaultRaw: 'current_timestamp',
    onUpdate: () => new Date(),
  })
  updated_at: Date;
}
