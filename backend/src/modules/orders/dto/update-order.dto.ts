import { IsIn, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  @IsOptional()
  @IsIn(['UNPAID', 'PAID', 'REFUNDED'])
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
}
