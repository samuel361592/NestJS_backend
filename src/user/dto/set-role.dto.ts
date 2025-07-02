import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class SetRoleDto {
  @ApiProperty({ example: [1, 2], description: '角色 ID 陣列' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roleIds: number[];
}
