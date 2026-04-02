import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  officialEmail: string;

  @IsString()
  password: string;
}
