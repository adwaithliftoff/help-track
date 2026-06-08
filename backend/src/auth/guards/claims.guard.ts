import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;
    const user = context.switchToHttp().getRequest().user;
    const userPermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
    });
    const permissions = userPermissions.map((p) => p.permission);
    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  }
}
