import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SaveReviewDto {
  @IsString()
  userId!: string;

  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
