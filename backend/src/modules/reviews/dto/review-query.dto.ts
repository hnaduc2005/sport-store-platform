import { Type } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsNumberString()
  rating?: string;

  @IsOptional()
  @IsBooleanString()
  isVisible?: string;

  @IsOptional()
  @IsIn(['all', 'visible', 'hidden'])
  visibility?: 'all' | 'visible' | 'hidden';

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
