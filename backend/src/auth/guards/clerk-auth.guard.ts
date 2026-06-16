import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeesService } from 'src/employees/employees.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject('EMPLOYEE_SERVICE')
    private readonly employeesService: EmployeesService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.__session;
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const user = await this.employeesService.findByClerkUserId(payload.sub);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
