import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsInt,
  Min,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreateTestUserDto {
  @ApiProperty({ example: 'testuser', description: '用戶名稱' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'testuser@example.com', description: '電子郵件' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test1234', description: '密碼' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 25, description: '年齡' })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: [1, 2], description: '角色 ID 陣列' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  roleIds: number[];
}
