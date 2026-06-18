import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetDocument, AssetSchema } from 'src/mongoose.schemas';
import { Model } from 'mongoose';
import { AssetsMongooseService } from './assets.mongoose.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    EmployeesModule,
    PermissionsModule,
  ],
  controllers: [AssetsController],
  providers: [
    {
      provide: 'ASSET_SERVICE',
      inject: [ConfigService, PrismaService, getModelToken(Asset.name)],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        assetModel: Model<AssetDocument>,
      ) => {
        return config.get<string>('DB') === 'mongo'
          ? new AssetsMongooseService(assetModel)
          : new AssetsService(prisma);
      },
    },
    PrismaService,
  ],
})
export class AssetsModule {}
