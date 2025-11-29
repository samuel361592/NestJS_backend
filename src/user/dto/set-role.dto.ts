import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, Validate } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'UniqueArray', async: false })
export class UniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(arr: any[], args: ValidationArguments) {
    return Array.isArray(arr) && new Set(arr).size === arr.length;
  }
  defaultMessage(args: ValidationArguments) {
    return 'roleIds 不能有重複值';
  }
}

export class SetRoleDto {
  @ApiProperty({ example: [1, 2], description: '角色 ID 陣列' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Validate(UniqueArrayConstraint)
  roleIds: number[];
}