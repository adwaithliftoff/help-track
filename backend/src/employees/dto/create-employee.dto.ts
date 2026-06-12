import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmployeeStatus, RoleName } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  @IsInt()
  employeeNumber: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  officialEmail: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  designation: string;

  @IsDateString()
  joiningDate: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status: EmployeeStatus;

  @IsEnum(RoleName)
  @IsOptional()
  role: RoleName;
}
