import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      return await this.prisma.employee.create({
        data: {
          ...createEmployeeDto,
          joiningDate: new Date(createEmployeeDto.joiningDate),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An employee with this email or employee number already exists',
        );
      }
      throw error;
    }
  }

  async upsertFromClerk(data) {
    return this.prisma.employee.upsert({
      where: { clerkUserId: data.clerkUserId },
      create: {
        clerkUserId: data.clerkUserId,
        fullName: data.fullName,
        officialEmail: data.officialEmail,
      },
      update: {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
      },
    });
  }

  async findAll(employeeNumber, fullName) {
    return this.prisma.employee.findMany({
      where: {
        employeeNumber,
        fullName: { contains: fullName, mode: 'insensitive' },
      },
      include: { department: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { department: true },
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
    });
  }

  async updateRole({ clerkUserId, clerkRole }) {
    const roleMap = {
      'org:admin': 'ADMIN',
      'org:member': 'EMPLOYEE',
    };

    const internalRole = roleMap[clerkRole] ?? 'EMPLOYEE';

    return this.prisma.employee.update({
      where: {
        clerkUserId,
      },
      data: {
        role: internalRole,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
