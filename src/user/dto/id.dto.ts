import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class IdDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => +value)
  @IsNumber()
  id: number;
}
