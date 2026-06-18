import { IsDateString, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  assetId: string;

  @IsString()
  assignedEmployeeId: string;

  @IsDateString()
  allocationDate: string;

  @IsString()
  allocatedById: string;

  @IsString()
  remarks: string;
}
