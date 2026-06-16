import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [EmployeesModule, PermissionsModule],
  controllers: [AllocationsController],
  providers: [AllocationsService, PrismaService],
})
export class AllocationsModule {}
