import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        password: hashedPassword,
        joiningDate: new Date(createEmployeeDto.joiningDate),
      },
      omit: { password: true },
    });
  }

  async findAll(employeeNumber, fullName) {
    return this.prisma.employee.findMany({
      where: {
        employeeNumber,
        fullName: { contains: fullName, mode: 'insensitive' },
      },
      omit: { password: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { officialEmail: email },
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.joiningDate) {
      data.joiningDate = new Date(updateEmployeeDto.joiningDate);
    }
    return this.prisma.employee.update({
      data,
      where: { id },
      omit: { password: true },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
