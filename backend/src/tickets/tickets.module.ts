import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [EmployeesModule, PermissionsModule],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
})
export class TicketsModule {}
