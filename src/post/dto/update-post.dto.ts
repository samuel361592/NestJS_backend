import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    example: '更新後的標題',
    description: '文章標題，可選',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '這是更新後的內容',
    description: '文章內容，可選',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
