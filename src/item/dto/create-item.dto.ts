import { IsNotEmpty, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  height: number;

  @IsNotEmpty()
  width: number;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  colorIds: number[];
}
