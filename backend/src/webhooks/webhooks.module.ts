import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { EmployeesService } from 'src/employees/employees.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [WebhooksController],
  providers: [EmployeesService, PrismaService],
})
export class WebhooksModule {}
