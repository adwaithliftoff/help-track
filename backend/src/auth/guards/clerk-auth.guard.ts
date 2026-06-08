import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.__session;
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const user = await this.prismaService.employee.findUnique({
        where: { clerkUserId: payload.sub },
      });
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
