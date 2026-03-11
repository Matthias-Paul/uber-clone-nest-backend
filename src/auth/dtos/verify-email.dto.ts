import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;
}
