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
import { SelfGuard } from 'src/auth/guards/self.guard';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(JwtAuthGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_CREATE')
  @Post()
  allocate(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.allocate(createAllocationDto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_UPDATE')
  @Patch(':id/return')
  return(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReturnAllocationDto,
  ) {
    return this.allocationsService.return(id, dto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('ALLOCATION_READ')
  @Get('asset/:id')
  getByAsset(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByAsset(id);
  }

  @UseGuards(SelfGuard)
  @RequirePermissions('ALLOCATION_READ')
  @Get('employee/:id')
  getByEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByEmployee(id);
  }
}
