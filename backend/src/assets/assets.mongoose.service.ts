import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import {
  Asset,
  AssetCategory,
  AssetDocument,
  AssetStatus,
} from 'src/mongoose.schemas';

@Injectable()
export class AssetsMongooseService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
  ) {}

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

    const doc: Record<string, any> = {
      ...baseFields,
      ...(baseFields.purchaseDate
        ? { purchaseDate: new Date(baseFields.purchaseDate) }
        : {}),
    };

    if (['HARDWARE', 'ACCESSORY'].includes(createAssetDto.assetCategory)) {
      doc.physicalAsset = { serialNumber, macAddress, assetTag };
    } else if (
      ['SOFTWARE', 'AI_SUBSCRIPTION', 'SAAS_TOOL'].includes(
        createAssetDto.assetCategory,
      )
    ) {
      doc.digitalSubscription = {
        planLicenseType,
        totalSeats,
        accountOwner,
        licenseKey,
        ...(renewalDate ? { renewalDate: new Date(renewalDate) } : {}),
      };
    }

    return this.assetModel.create(doc);
  }

  async findAll(
    assetName?: string,
    assetTag?: string,
    macAddress?: string,
    serialNumber?: string,
    assetCategory?: AssetCategory,
    assetType?: string,
    status?: AssetStatus,
  ) {
    const assets = await this.assetModel.find({
      ...(assetName && { assetName: { $regex: assetName, $options: 'i' } }),
      ...(assetCategory && { assetCategory }),
      ...(assetType && { assetType: { $regex: assetType, $options: 'i' } }),
      ...(status && { status }),
      ...(assetTag && {
        'physicalAsset.assetTag': { $regex: assetTag, $options: 'i' },
      }),
      ...(macAddress && {
        'physicalAsset.macAddress': { $regex: macAddress, $options: 'i' },
      }),
      ...(serialNumber && {
        'physicalAsset.serialNumber': {
          $regex: serialNumber,
          $options: 'i',
        },
      }),
    });
    return assets.map((e) => ({ ...e.toObject(), id: e._id.toString() }));
  }

  async findOne(id: string) {
    const asset = await this.assetModel.findById(id);
    if (!asset) throw new NotFoundException('Asset not found');
    return { ...asset.toObject(), id: asset._id.toString() };
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
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

    const existing = await this.assetModel.findById(id);
    if (!existing) throw new NotFoundException('Asset not found');

    const update: Record<string, any> = { ...baseFields };
    const category = baseFields.assetCategory ?? existing.assetCategory;

    if (['HARDWARE', 'ACCESSORY'].includes(category)) {
      update.physicalAsset = {
        ...existing.physicalAsset,
        serialNumber,
        macAddress,
        assetTag,
      };
    } else if (
      ['SOFTWARE', 'AI_SUBSCRIPTION', 'SAAS_TOOL'].includes(category)
    ) {
      update.digitalSubscription = {
        ...existing.digitalSubscription,
        planLicenseType,
        totalSeats,
        accountOwner,
        licenseKey,
        ...(renewalDate ? { renewalDate: new Date(renewalDate) } : {}),
      };
    }

    return this.assetModel.findByIdAndUpdate(id, update, { new: true });
  }

  remove(id: string) {
    return this.assetModel.findByIdAndDelete(id);
  }
}
