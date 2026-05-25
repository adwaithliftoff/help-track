import { Body, Controller, Post } from '@nestjs/common';
import { EmployeesService } from 'src/employees/employees.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private employeesService: EmployeesService) {}
  @Post()
  handle(@Body() body) {
    const { type, data } = body;
    switch (type) {
      case 'user.created':
      case 'user.updated':
        return this.employeesService.upsertFromClerk({
          clerkUserId: data.id,
          fullName: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
          officialEmail: data.email_addresses?.[0]?.email_address,
        });
      case 'organizationMembership.updated':
        return this.employeesService.updateRole({
          clerkUserId: data.public_user_data.user_id,
          clerkRole: data.role,
        });
    }
  }
}
