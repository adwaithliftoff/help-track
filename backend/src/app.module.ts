import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { AllocationsModule } from './allocations/allocations.module';

@Module({
  imports: [
    EmployeesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AssetsModule,
    AllocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
