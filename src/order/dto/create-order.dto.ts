import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber('TN')
  phoneNumber: string;

  @IsString()
  cart: string;
}
