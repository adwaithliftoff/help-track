import { Permission, PrismaClient, RoleName } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export async function seedPrisma() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  try {
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

    await prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    console.log('Seeded role permissions');
  } finally {
    await prisma.$disconnect();
  }
}
