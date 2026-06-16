import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [EmployeesModule, PermissionsModule],
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
})
export class AssetsModule {}
