import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, Min, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'UniqueArray', async: false })
export class UniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return Array.isArray(value) && new Set(value).size === value.length;
  }

  defaultMessage(): string {
    return 'roleIds 不能有重複值';
  }
}

export class SetRoleDto {
  @ApiProperty({ example: [1, 2], description: '角色 ID 陣列' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Validate(UniqueArrayConstraint)
  roleIds: number[];
}
