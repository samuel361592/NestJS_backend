import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Length(8, 60)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @Max(120)
  age: number;
}
