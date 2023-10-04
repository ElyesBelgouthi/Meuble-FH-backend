import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsPhoneNumber('TN')
  phoneNumber: string;

  @IsNotEmpty()
  totalPrice: string;

  @IsString()
  @IsNotEmpty()
  cart: string;
}
