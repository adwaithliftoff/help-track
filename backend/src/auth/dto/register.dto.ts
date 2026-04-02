import { IsDateString, IsEmail, IsInt, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  officialEmail: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsInt()
  employeeNumber: number;

  @IsString()
  department: string;

  @IsString()
  designation: string;

  @IsDateString()
  joiningDate: string;
}
