import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAllocationDto } from './dto/return-allocation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SelfGuard } from 'src/auth/guards/self.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  allocate(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.allocate(createAllocationDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/return')
  return(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReturnAllocationDto,
  ) {
    return this.allocationsService.return(id, dto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('asset/:id')
  getByAsset(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByAsset(id);
  }

  @UseGuards(SelfGuard)
  @Get('employee/:id')
  getByEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByEmployee(id);
  }
}
