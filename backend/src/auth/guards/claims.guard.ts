import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PERMISSION_SERVICE')
    private readonly permissionsService: PermissionsService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;
    const user = context.switchToHttp().getRequest().user;
    const userPermissions = await this.permissionsService.getPermissions(
      user.role,
    );
    const permissions = userPermissions.map((p) => p.permission);
    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  }
}
