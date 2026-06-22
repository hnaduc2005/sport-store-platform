import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  userId!: string;

  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsString()
  @MinLength(8)
  phone!: string;

  @IsString()
  @MinLength(8)
  address!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsIn(['COD', 'BANK_TRANSFER'])
  paymentMethod!: 'COD' | 'BANK_TRANSFER';
}
