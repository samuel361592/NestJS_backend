import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class IdParamDto {
  @Type(() => Number)
  @IsInt({ message: 'id 必須是整數' })
  @Min(1, { message: 'id 必須大於等於 1' })
  id: number;
}
