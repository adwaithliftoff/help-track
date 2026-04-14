import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AllocationsController],
  providers: [AllocationsService, PrismaService],
})
export class AllocationsModule {}
