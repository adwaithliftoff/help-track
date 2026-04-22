import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SelfGuard } from 'src/auth/guards/self.guard';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(JwtAuthGuard, ClaimsGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions('EMPLOYEE_CREATE')
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @RequirePermissions('EMPLOYEE_READ')
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @UseGuards(SelfGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @RequirePermissions('EMPLOYEE_UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @RequirePermissions('EMPLOYEE_DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
