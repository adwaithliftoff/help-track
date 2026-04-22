import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;
    const user = context.switchToHttp().getRequest().user;
    return requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );
  }
}
