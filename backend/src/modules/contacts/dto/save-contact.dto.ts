import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class SaveContactDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(3)
  subject!: string;

  @IsString()
  @MinLength(10)
  message!: string;
}

export class UpdateContactDto {
  @IsIn(['NEW', 'READ', 'RESOLVED'])
  status!: 'NEW' | 'READ' | 'RESOLVED';
}
