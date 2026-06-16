import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RolePermission,
  RolePermissionDocument,
  RolePermissionSchema,
} from 'src/mongoose.schemas';
import { PermissionsMongooseService } from './permissions.mongoose.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  providers: [
    {
      provide: 'PERMISSION_SERVICE',
      inject: [
        ConfigService,
        PrismaService,
        getModelToken(RolePermission.name),
      ],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        permissionModel: Model<RolePermissionDocument>,
      ) => {
        return config.get<string>('DB') === 'mongo'
          ? new PermissionsMongooseService(permissionModel)
          : new PermissionsService(prisma);
      },
    },
    PrismaService,
  ],
  exports: ['PERMISSION_SERVICE'],
})
export class PermissionsModule {}
