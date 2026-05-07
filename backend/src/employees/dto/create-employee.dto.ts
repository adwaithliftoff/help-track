import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmployeeStatus, RoleName } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  @IsInt()
  employeeNumber: number;

  @IsString()
  fullName: string;

  @IsEmail()
  officialEmail: string;

  @IsString()
  password: string;

  @IsInt()
  departmentId: number;

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
