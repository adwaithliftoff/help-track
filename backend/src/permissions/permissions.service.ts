import { Injectable } from '@nestjs/common';
import { RoleName } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { IPermissionsService } from './permissions.interface';

@Injectable()
export class PermissionsService implements IPermissionsService {
  constructor(private readonly prisma: PrismaService) {}
  async getPermissions(role: RoleName) {
    return await this.prisma.rolePermission.findMany({
      where: { role },
    });
  }
}
