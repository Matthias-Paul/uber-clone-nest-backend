

import {
  IsDecimal,
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  origin_address: string;

  @IsString()
  @IsNotEmpty()
  destination_address: string;

  @IsLatitude()
  origin_latitude: string;

  @IsLongitude()
  origin_longitude: string;

  @IsLatitude()
  destination_latitude: string;

  @IsLongitude()
  destination_longitude: string;

  @IsInt()
  @Min(1)
  ride_time: number;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsDecimal({ decimal_digits: '0,2' })
  fare_price: string;

  @IsString()
  @IsNotEmpty()
  payment_status: string;

  @IsInt()
  @IsNotEmpty()
  driver_id: number;

  @IsInt()
  @IsNotEmpty()
  user_id: number;
}
