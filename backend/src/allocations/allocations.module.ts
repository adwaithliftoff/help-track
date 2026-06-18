import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesModule } from 'src/employees/employees.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  AllocationHistory,
  AllocationHistoryDocument,
  AllocationHistorySchema,
  Asset,
  AssetDocument,
  AssetSchema,
  Employee,
  EmployeeDocument,
  EmployeeSchema,
} from 'src/mongoose.schemas';
import { Model } from 'mongoose';
import { AllocationsMongooseService } from './allocations.mongoose.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AllocationHistory.name, schema: AllocationHistorySchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    EmployeesModule,
    PermissionsModule,
  ],
  controllers: [AllocationsController],
  providers: [
    {
      provide: 'ALLOCATION_SERVICE',
      inject: [
        ConfigService,
        PrismaService,
        getModelToken(AllocationHistory.name),
        getModelToken(Asset.name),
        getModelToken(Employee.name),
      ],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        AllocationHistoryModel: Model<AllocationHistoryDocument>,
        AssetModel: Model<AssetDocument>,
        EmployeeModel: Model<EmployeeDocument>,
      ) => {
        return config.get<string>('DB') === 'mongo'
          ? new AllocationsMongooseService(
              AllocationHistoryModel,
              AssetModel,
              EmployeeModel,
            )
          : new AllocationsService(prisma);
      },
    },
    PrismaService,
  ],
})
export class AllocationsModule {}
