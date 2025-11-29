import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '使用者的 Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '密碼需為 8~60 字元' })
  @Length(8, 60)
  password: string;

  @ApiProperty({ example: 'Samuel', description: '使用者名稱' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 25, description: '年齡，需介於 0~120 之間' })
  @IsInt()
  @Min(0)
  @Max(120)
  age: number;
}
