import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @ValidateIf(
    (dto: UpdatePostDto) =>
      dto.title === undefined && dto.content === undefined,
  )
  @IsDefined({ message: 'title 或 content 至少需要提供一個' })
  private readonly atLeastOneField?: never;

  @ApiProperty({
    example: '更新後的標題',
    description: '文章標題，可選',
    required: false,
  })
  @Transform(({ value }) => {
    const input: unknown = value;
    return typeof input === 'string' ? input.trim() : input;
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: '這是更新後的內容',
    description: '文章內容，可選',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
