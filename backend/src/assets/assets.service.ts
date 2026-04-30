import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll(assetName, assetTag, macAddress, serialNumber) {
    return this.prisma.asset.findMany({
      where: {
        assetName: { contains: assetName, mode: 'insensitive' },
        ...((assetTag || macAddress || serialNumber) && {
          physicalAsset: {
            assetTag: { contains: assetTag, mode: 'insensitive' },
            macAddress: { contains: macAddress, mode: 'insensitive' },
            serialNumber: { contains: serialNumber, mode: 'insensitive' },
          },
        }),
      },
      include: { digitalSubscription: true, physicalAsset: true },
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { digitalSubscription: true, physicalAsset: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
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
    } = updateAssetDto;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.asset.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Asset not found');

      const asset = await tx.asset.update({
        where: { id },
        data: baseFields,
      });

      if (['HARDWARE', 'ACCESSORY'].includes(asset.assetCategory)) {
        await tx.physicalAsset.upsert({
          where: { assetId: id },
          update: { serialNumber, macAddress, assetTag },
          create: { assetId: id, serialNumber, macAddress, assetTag },
        });
      } else if (
        ['SOFTWARE', 'AI_SUBSCRIPTION', 'SAAS_TOOL'].includes(
          asset.assetCategory,
        )
      ) {
        await tx.digitalSubscription.upsert({
          where: { assetId: id },
          update: {
            planLicenseType,
            totalSeats,
            renewalDate: renewalDate ? new Date(renewalDate) : undefined,
            accountOwner,
            licenseKey,
          },
          create: {
            assetId: id,
            planLicenseType,
            totalSeats,
            renewalDate: renewalDate ? new Date(renewalDate) : null,
            accountOwner,
            licenseKey,
          },
        });
      }
      return tx.asset.findUnique({
        where: { id },
        include: {
          physicalAsset: true,
          digitalSubscription: true,
        },
      });
    });
  }

  remove(id: number) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
