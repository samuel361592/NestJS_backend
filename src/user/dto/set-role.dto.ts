import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class SetRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsIn(['admin', 'user'])
  role: string;
}
