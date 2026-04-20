import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
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
  serialNumber?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  planLicenseType?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  totalSeats?: number;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  accountOwner?: string;

  @IsOptional()
  @IsString()
  licenseKey?: string;
}
