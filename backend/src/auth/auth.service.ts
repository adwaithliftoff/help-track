import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeesService } from 'src/employees/employees.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.employeesService.findByEmail(dto.officialEmail);
    if (existing) throw new BadRequestException('Email already exists');
    const user = this.employeesService.create({
      ...dto,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    });
    return user;
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.employeesService.findByEmail(dto.officialEmail);
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid Credentials');

    const payload = { sub: user.id };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '5m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '1d',
      }),
    ]);
    res.cookie('access_token', access_token, {});
    res.cookie('refresh_token', refresh_token, {});
    return { message: 'Logged in successfully' };
  }
}
