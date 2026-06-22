import { IsBooleanString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ProductQueryDto {
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
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsBooleanString()
  onSale?: string;

  @IsOptional()
  @IsIn(['newest', 'price-asc', 'price-desc', 'best-selling', 'relevant'])
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'relevant';
}
