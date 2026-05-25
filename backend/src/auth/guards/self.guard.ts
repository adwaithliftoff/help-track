import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const paramId = Number(request.params.id);
    const user = request.user;

    const employee = await this.prisma.employee.findUnique({
      where: { clerkUserId: user.sub },
      select: { id: true },
    });

    if (!employee) throw new ForbiddenException('Access denied');
    if (employee.id === paramId) return true;

    const requiredPermissions = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    if (user.o.rol === 'admin') {
      user.role = 'ADMIN';
    } else {
      user.role = 'EMPLOYEE';
    }

    const userPermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
    });
    const permissions = userPermissions.map((p) => p.permission);
    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) throw new ForbiddenException('Access denied');
    return true;
  }
}
