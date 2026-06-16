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
          departmentId: createEmployeeDto.departmentId
            ? Number(createEmployeeDto.departmentId)
            : undefined,
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
        ...(employeeNumber && { employeeNumber }),
        ...(fullName && {
          fullName: { contains: fullName, mode: 'insensitive' },
        }),
      },
      include: { department: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id: Number(id) },
      include: { department: true },
    });
  }

  async findByClerkUserId(clerkUserId: string) {
    return this.prisma.employee.findUnique({
      where: { clerkUserId },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.joiningDate) {
      data.joiningDate = new Date(updateEmployeeDto.joiningDate);
    }
    if (updateEmployeeDto.departmentId) {
      data.departmentId = Number(updateEmployeeDto.departmentId);
    }
    return this.prisma.employee.update({
      data,
      where: { id: Number(id) },
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

  async remove(id: string) {
    return this.prisma.employee.delete({
      where: { id: Number(id) },
    });
  }
}
