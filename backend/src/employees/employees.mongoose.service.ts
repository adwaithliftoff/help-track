import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee, EmployeeDocument } from 'src/mongoose.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class EmployeesMongooseService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const { departmentId, ...rest } = createEmployeeDto;

      const employee = new this.employeeModel({
        ...rest,
        joiningDate: new Date(createEmployeeDto.joiningDate),
        ...(departmentId && { departmentId: new Types.ObjectId(departmentId) }),
      });
      return await employee.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'An employee with this email or employee number already exists',
        );
      }
      throw error;
    }
  }

  async upsertFromClerk(data) {
    return this.employeeModel.findOneAndUpdate(
      { clerkUserId: data.clerkUserId },
      {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
        clerkUserId: data.clerkUserId,
      },
      { upsert: true, new: true },
    );
  }

  async findAll(employeeNumber, fullName) {
    const employees = await this.employeeModel
      .find({
        ...(employeeNumber && { employeeNumber }),
        ...(fullName && { fullName: { $regex: fullName, $options: 'i' } }),
      })
      .populate('departmentId');
    return employees.map((e) => ({ ...e.toObject(), id: e._id.toString() }));
  }

  async findOne(id: string) {
    const employee = await this.employeeModel
      .findById(id)
      .populate('departmentId');
    if (!employee) throw new NotFoundException('Asset not found');
    return { ...employee.toObject(), id: employee._id.toString() };
  }

  async findByClerkUserId(clerkUserId: string) {
    return this.employeeModel.findOne({ clerkUserId }).lean();
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const data: any = { ...updateEmployeeDto };
    if (updateEmployeeDto.joiningDate) {
      data.joiningDate = new Date(updateEmployeeDto.joiningDate);
    }
    if (updateEmployeeDto.departmentId) {
      data.departmentId = new Types.ObjectId(updateEmployeeDto.departmentId);
    }
    return this.employeeModel.findByIdAndUpdate(id, data, { new: true });
  }

  async updateRole({ clerkUserId, clerkRole }) {
    const roleMap = {
      'org:admin': 'ADMIN',
      'org:member': 'EMPLOYEE',
    };

    const internalRole = roleMap[clerkRole] ?? 'EMPLOYEE';

    return this.employeeModel.findOneAndUpdate(
      { clerkUserId },
      { role: internalRole },
      { new: true },
    );
  }

  async remove(id: string) {
    return this.employeeModel.findByIdAndDelete(id);
  }
}
