// src/user/dto/assign-roles.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ example: [1, 2], description: '要指派的角色 ID 陣列' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roleIds: number[];
}
