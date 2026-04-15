import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { PrismaService } from 'src/prisma.service';
import { AssetStatus, RoleName } from 'generated/prisma/enums';
import { ReturnAllocationDto } from './dto/return-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(private prisma: PrismaService) {}

  private async validateAdmin(id: number, field: string) {
    const admin = await this.prisma.employee.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException(`${field} employee not found`);
    if (admin.role === RoleName.EMPLOYEE)
      throw new BadRequestException(`${field} must be an admin`);
  }

  async allocate(dto: CreateAllocationDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.status === AssetStatus.ALLOCATED)
      throw new BadRequestException('Asset already allocated');

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.assignedEmployeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    await this.validateAdmin(dto.allocatedById, 'allocatedBy');

    const [allocation] = await this.prisma.$transaction([
      this.prisma.allocationHistory.create({
        data: { ...dto, allocationDate: new Date(dto.allocationDate) },
      }),
      this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { status: AssetStatus.ALLOCATED },
      }),
    ]);
    return allocation;
  }

  async return(id: number, dto: ReturnAllocationDto) {
    const allocation = await this.prisma.allocationHistory.findUnique({
      where: { id },
    });
    if (!allocation) throw new NotFoundException('Allocation not found');
    if (allocation.returnDate)
      throw new BadRequestException('Asset already returned');
    await this.validateAdmin(dto.receivingAdminId, 'receivingAdmin');

    const [updated] = await this.prisma.$transaction([
      this.prisma.allocationHistory.update({
        where: { id },
        data: { ...dto, returnDate: new Date(dto.returnDate) },
      }),
      this.prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: AssetStatus.INVENTORY },
      }),
    ]);
    return updated;
  }

  async getByAsset(assetId: number) {
    return this.prisma.allocationHistory.findMany({
      where: { assetId: assetId },
      include: {
        assignedEmployee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        allocatedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        receivingAdmin: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getByEmployee(employeeId: number) {
    return this.prisma.allocationHistory.findMany({
      where: { assignedEmployeeId: employeeId },
    });
  }
}
