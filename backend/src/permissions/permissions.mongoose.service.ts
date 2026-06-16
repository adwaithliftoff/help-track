import { Injectable } from '@nestjs/common';
import { IPermissionsService } from './permissions.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  RoleName,
  RolePermission,
  RolePermissionDocument,
} from 'src/mongoose.schemas';
import { Model } from 'mongoose';

@Injectable()
export class PermissionsMongooseService implements IPermissionsService {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  async getPermissions(role: RoleName) {
    return this.rolePermissionModel.find({ role }).lean();
  }
}
