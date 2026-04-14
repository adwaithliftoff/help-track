import { IsDateString, IsEnum, IsInt, IsString } from 'class-validator';
import { ReturnCondition } from 'generated/prisma/enums';

export class ReturnAllocationDto {
  @IsDateString()
  returnDate: string;

  @IsEnum(ReturnCondition)
  returnCondition: ReturnCondition;

  @IsInt()
  receivingAdminId: number;

  @IsString()
  remarks: string;
}
