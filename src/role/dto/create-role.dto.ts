import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: '角色名稱' })
  @IsString()
  @MinLength(2)
  name: string;
}
