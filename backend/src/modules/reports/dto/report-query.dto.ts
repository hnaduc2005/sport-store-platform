import { IsIn, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsIn(['day', 'month'])
  period?: 'day' | 'month';
}
