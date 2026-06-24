import { IsIn, IsOptional, IsString } from 'class-validator';

import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class AdminProductQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsIn(['all', 'active', 'inactive'])
  status?: 'all' | 'active' | 'inactive';

  @IsOptional()
  @IsIn(['all', 'in-stock', 'low-stock', 'out-of-stock'])
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
