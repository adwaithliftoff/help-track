import { SetMetadata } from '@nestjs/common';
import { Permission } from 'generated/prisma/enums';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
