import { ArrayNotEmpty, IsArray, IsBoolean, IsString } from 'class-validator';

export class BulkProductStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @IsBoolean()
  isActive!: boolean;
}
