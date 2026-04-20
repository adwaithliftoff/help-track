import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  create(createAssetDto: CreateAssetDto) {
    const {
      serialNumber,
      macAddress,
      assetTag,
      planLicenseType,
      totalSeats,
      renewalDate,
      accountOwner,
      licenseKey,
      ...baseFields
    } = createAssetDto;
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        data: {
          ...baseFields,
          ...(baseFields.purchaseDate
            ? { purchaseDate: new Date(baseFields.purchaseDate) }
            : {}),
        },
      });

      if (['HARDWARE', 'ACCESSORY'].includes(createAssetDto.assetCategory)) {
        await tx.physicalAsset.create({
          data: { assetId: asset.id, serialNumber, macAddress, assetTag },
        });
      } else if (
        ['SOFTWARE', 'AI_SUBSCRIPTION', 'SAAS_TOOL'].includes(
          createAssetDto.assetCategory,
        )
      ) {
        await tx.digitalSubscription.create({
          data: {
            assetId: asset.id,
            planLicenseType,
            totalSeats,
            renewalDate,
            accountOwner,
            licenseKey,
            ...(renewalDate ? { renewalDate: new Date(renewalDate) } : {}),
          },
        });
      }
      return asset;
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
