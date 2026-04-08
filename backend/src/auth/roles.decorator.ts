import { SetMetadata } from '@nestjs/common';
import { RoleName } from 'generated/prisma/enums';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
