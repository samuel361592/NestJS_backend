import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: '角色名稱，例如：user、admin、editor 等',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
