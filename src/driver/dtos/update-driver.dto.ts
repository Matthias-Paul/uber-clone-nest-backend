import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateDriverDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(24)
  username: string;

  @IsString()
  @IsNotEmpty()
  profile_image_url: string;

  @IsString()
  @IsNotEmpty()
  car_image_url: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  car_seat: number;

  @IsInt()
  @IsNotEmpty()
  driver_id: number;
}
