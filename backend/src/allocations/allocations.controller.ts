import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Get,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAllocationDto } from './dto/return-allocation.dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  allocate(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.allocate(createAllocationDto);
  }

  @Patch(':id/return')
  return(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReturnAllocationDto,
  ) {
    return this.allocationsService.return(id, dto);
  }

  @Get('asset/:id')
  getByAsset(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByAsset(id);
  }

  @Get('employee/:id')
  getByEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.allocationsService.getByEmployee(id);
  }
}
