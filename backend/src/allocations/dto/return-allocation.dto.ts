import { IsDateString, IsEnum, IsString } from 'class-validator';
import { ReturnCondition } from 'generated/prisma/enums';

export class ReturnAllocationDto {
  @IsDateString()
  returnDate: string;

  @IsEnum(ReturnCondition)
  returnCondition: ReturnCondition;

  @IsString()
  receivingAdminId: string;

  @IsString()
  remarks: string;
}
