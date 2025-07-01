import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SetRoleDto {
  @ApiProperty({ example: 2, description: '要指派的角色 ID' })
  @IsInt()
  @Min(1)
  roleId: number;
}
