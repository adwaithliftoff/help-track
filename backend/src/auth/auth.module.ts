import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmployeesModule } from 'src/employees/employees.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  imports: [EmployeesModule, JwtModule.register({})],
})
export class AuthModule {}
