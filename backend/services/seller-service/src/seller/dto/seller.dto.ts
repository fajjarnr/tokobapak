import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { SellerStatus } from '../entities/seller.entity';

export class CreateSellerDto {
  @IsString()
  userId: string;

  @IsString()
  storeName: string;

  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateSellerStatusDto {
  @IsEnum(SellerStatus)
  status: SellerStatus;
}
