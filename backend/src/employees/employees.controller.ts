import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  Inject,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { SelfGuard } from 'src/auth/guards/self.guard';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(ClerkAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    @Inject('EMPLOYEE_SERVICE')
    private readonly employeesService: EmployeesService,
  ) {}

  @UseGuards(ClaimsGuard)
  @RequirePermissions('EMPLOYEE_CREATE')
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('EMPLOYEE_READ')
  @Get()
  findAll(@Query('id') id?: string, @Query('name') name?: string) {
    return this.employeesService.findAll(
      id && Number(id) ? +id : undefined,
      name,
    );
  }

  @Get('me')
  findMe(@Req() req) {
    if (req.user._id) {
      req.user.id = req.user._id.toString();
    }
    return this.employeesService.findOne(req.user.id);
  }

  @UseGuards(SelfGuard)
  @RequirePermissions('EMPLOYEE_READ')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('EMPLOYEE_UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @UseGuards(ClaimsGuard)
  @RequirePermissions('EMPLOYEE_DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
