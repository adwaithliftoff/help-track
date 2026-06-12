import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { EmployeesModule } from 'src/employees/employees.module';

@Module({
  imports: [EmployeesModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
