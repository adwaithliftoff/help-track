import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PERMISSION_SERVICE')
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const paramId = Number(request.params.id);
    const user = request.user;

    if (user.id === paramId) return true;
    const requiredPermissions = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    const userPermissions = await this.permissionsService.getPermissions(
      user.role,
    );
    const permissions = userPermissions.map((p) => p.permission);
    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) throw new ForbiddenException('Access denied');
    return true;
  }
}
