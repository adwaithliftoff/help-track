import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Get,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAllocationDto } from './dto/return-allocation.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { SelfGuard } from 'src/auth/guards/self.guard';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(ClerkAuthGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(
    @Inject('ALLOCATION_SERVICE')
    private readonly allocationsService: AllocationsService,
  ) {}

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_CREATE')
  @Post()
  allocate(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.allocate(createAllocationDto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_UPDATE')
  @Patch(':id/return')
  return(@Param('id') id: string, @Body() dto: ReturnAllocationDto) {
    return this.allocationsService.return(id, dto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_READ')
  @Get('asset/:id')
  getByAsset(@Param('id') id: string) {
    return this.allocationsService.getByAsset(id);
  }

  @UseGuards(SelfGuard)
  @RequirePermissions('ALLOCATION_READ')
  @Get('employee/:id')
  getByEmployee(@Param('id') id: string) {
    return this.allocationsService.getByEmployee(id);
  }
}
