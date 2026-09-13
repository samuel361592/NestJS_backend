import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: '角色名稱，例如：user、admin、editor 等',
  })
  @Transform(({ value }) => {
    const input: unknown = value;
    return typeof input === 'string' ? input.trim() : input;
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
