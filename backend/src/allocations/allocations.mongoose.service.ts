import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAllocationDto } from './dto/return-allocation.dto';
import {
  AllocationHistory,
  AllocationHistoryDocument,
  Asset,
  AssetDocument,
  AssetStatus,
  Employee,
  EmployeeDocument,
  RoleName,
} from 'src/mongoose.schemas';

@Injectable()
export class AllocationsMongooseService {
  constructor(
    @InjectModel(AllocationHistory.name)
    private allocationModel: Model<AllocationHistoryDocument>,
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  private async validateAdmin(id: string, field: string) {
    const admin = await this.employeeModel.findById(id);
    if (!admin) throw new NotFoundException(`${field} employee not found`);
    if (admin.role === RoleName.EMPLOYEE)
      throw new BadRequestException(`${field} must be an admin`);
  }

  async allocate(dto: CreateAllocationDto) {
    console.log(this.allocationModel);
    const asset = await this.assetModel.findById(dto.assetId);
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.status === AssetStatus.ALLOCATED)
      throw new BadRequestException('Asset already allocated');

    const employee = await this.employeeModel.findById(dto.assignedEmployeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    await this.validateAdmin(dto.allocatedById, 'allocatedBy');

    const session = await this.allocationModel.db.startSession();
    try {
      const allocation = await session.withTransaction(async () => {
        const [created] = await this.allocationModel.create(
          [
            {
              ...dto,
              assetId: new Types.ObjectId(dto.assetId),
              assignedEmployeeId: new Types.ObjectId(dto.assignedEmployeeId),
              allocatedById: new Types.ObjectId(dto.allocatedById),
              allocationDate: new Date(dto.allocationDate),
            },
          ],
          { session },
        );

        await this.assetModel.updateOne(
          { _id: dto.assetId },
          { status: AssetStatus.ALLOCATED },
          { session },
        );
        return created;
      });
      return allocation;
    } finally {
      await session.endSession();
    }
  }

  async return(id: string, dto: ReturnAllocationDto) {
    const allocation = await this.allocationModel.findById(id);
    if (!allocation) throw new NotFoundException('Allocation not found');
    if (allocation.returnDate)
      throw new BadRequestException('Asset already returned');
    await this.validateAdmin(dto.receivingAdminId, 'receivingAdmin');

    const session = await this.allocationModel.db.startSession();
    try {
      const updated = await session.withTransaction(async () => {
        const result = await this.allocationModel.findByIdAndUpdate(
          id,
          { ...dto, returnDate: new Date(dto.returnDate) },
          { new: true, session },
        );

        await this.assetModel.updateOne(
          { _id: allocation.assetId },
          { status: AssetStatus.INVENTORY },
          { session },
        );
        return result;
      });
      return updated;
    } finally {
      await session.endSession();
    }
  }

  async getByAsset(assetId: string) {
    return this.allocationModel
      .find({ assetId: new Types.ObjectId(assetId) })
      .populate('assignedEmployee')
      .populate('allocatedBy')
      .populate('receivingAdmin')
      .populate('asset')
      .exec();
  }

  async getByEmployee(employeeId: string) {
    const employeeAllocations = await this.allocationModel
      .find({ assignedEmployeeId: new Types.ObjectId(employeeId) })
      .populate('asset', 'assetName assetCategory assetType status')
      .exec();
    return employeeAllocations.map((e) => ({
      ...e.toObject(),
      id: e._id.toString(),
    }));
  }
}
