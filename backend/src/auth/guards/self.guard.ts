import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SelfGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const paramId = Number(request.params.id);
    const userId = request.user.sub;
    if (userId === paramId) return true;
    if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'ADMIN')
      return true;
    throw new ForbiddenException('You can only access your own data');
  }
}
