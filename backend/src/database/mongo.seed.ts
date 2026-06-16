import mongoose from 'mongoose';

const RoleName = { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN' } as const;

const Permission = [
  'EMPLOYEE_CREATE',
  'EMPLOYEE_READ',
  'EMPLOYEE_UPDATE',
  'EMPLOYEE_DELETE',
  'ASSET_CREATE',
  'ASSET_READ',
  'ASSET_UPDATE',
  'ASSET_DELETE',
  'ALLOCATION_CREATE',
  'ALLOCATION_READ',
  'ALLOCATION_UPDATE',
  'TICKET_READ',
  'TICKET_MANAGE',
  'TICKET_DELETE',
] as const;

export async function seedMongo() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  await mongoose.connect(mongoUri);

  try {
    const RolePermissionSchema = new mongoose.Schema(
      {
        role: { type: String, enum: Object.values(RoleName), required: true },
        permission: { type: String, enum: Permission, required: true },
      },
      { collection: 'rolepermissions' },
    );
    RolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

    const RolePermissionModel =
      mongoose.models.RolePermission ??
      mongoose.model('RolePermission', RolePermissionSchema);

    const allPermissions = Object.values(Permission);
    const rolePermissions = [
      ...allPermissions.map((permission) => ({
        role: RoleName.SUPER_ADMIN,
        permission,
      })),

      ...allPermissions.map((permission) => ({
        role: RoleName.ADMIN,
        permission,
      })),
    ];
    await RolePermissionModel.bulkWrite(
      rolePermissions.map((item) => ({
        updateOne: {
          filter: item,
          update: { $setOnInsert: item },
          upsert: true,
        },
      })),
    );
  } finally {
    await mongoose.disconnect();
  }
}
