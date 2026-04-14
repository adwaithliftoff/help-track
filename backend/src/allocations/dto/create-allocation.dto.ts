import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsInt()
  assetId: number;

  @IsInt()
  assignedEmployeeId: number;

  @IsDateString()
  allocationDate: string;

  @IsInt()
  allocatedById: number;

  @IsString()
  remarks: string;
}
