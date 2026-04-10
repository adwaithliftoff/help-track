import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        ...createAssetDto,
        ...(createAssetDto.purchaseDate
          ? { purchaseDate: new Date(createAssetDto.purchaseDate) }
          : {}),
      },
    });
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  findOne(id: number) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: { ...updateAssetDto },
    });
  }

  remove(id: number) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
