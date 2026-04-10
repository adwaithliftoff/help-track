import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetCategory, AssetStatus } from 'generated/prisma/enums';

export class CreateAssetDto {
  @IsEnum(AssetCategory)
  assetCategory: AssetCategory;

  @IsString()
  assetType: string;

  @IsString()
  assetName: string;

  @IsOptional()
  @IsString()
  brandVendor?: string;

  @IsOptional()
  @IsString()
  modelPlan?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  locationOwner?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;
}
