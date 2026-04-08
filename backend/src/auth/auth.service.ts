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
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

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

    const payload = { sub: user.id, role: user.role };
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
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'Logged in successfully' };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    try {
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!refreshSecret)
        throw new UnauthorizedException('Missing refresh secret');
      const payload = jwt.verify(refreshToken, refreshSecret) as any;

      const accessSecret = process.env.JWT_ACCESS_SECRET;
      if (!accessSecret)
        throw new UnauthorizedException('Missing access secret');
      const accessToken = jwt.sign(
        { sub: payload.sub, role: payload.role },
        accessSecret,
        { expiresIn: '5m' },
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return { message: 'Token refreshed' };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
