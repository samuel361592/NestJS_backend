import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: '我的第一篇文章' })
  @IsString()
  title: string;

  @ApiProperty({ example: '這是文章的內容' })
  @IsString()
  content: string;
}
