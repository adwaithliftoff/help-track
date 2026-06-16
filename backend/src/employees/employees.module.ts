import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployeesMongooseService } from './employees.mongoose.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  Department,
  DepartmentSchema,
  Employee,
  EmployeeDocument,
  EmployeeSchema,
} from 'src/mongoose.schemas';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    PermissionsModule,
  ],
  controllers: [EmployeesController],
  providers: [
    PrismaService,
    {
      provide: 'EMPLOYEE_SERVICE',
      inject: [ConfigService, PrismaService, getModelToken(Employee.name)],
      useFactory: (
        config: ConfigService,
        prisma: PrismaService,
        employeeModel: Model<EmployeeDocument>,
      ) => {
        return config.get<string>('DB') === 'mongo'
          ? new EmployeesMongooseService(employeeModel)
          : new EmployeesService(prisma);
      },
    },
  ],
  exports: ['EMPLOYEE_SERVICE'],
})
export class EmployeesModule {}
