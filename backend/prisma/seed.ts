import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  await prisma.employee.upsert({
    where: { officialEmail: 'admin@example.com' },
    update: {},
    create: {
      employeeNumber: 1,
      fullName: 'Admin',
      officialEmail: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      department: 'Admin',
      designation: 'Admin',
      joiningDate: new Date(),
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin user created');
}

main()
  .catch((e) => {
    console.log('Seeding failed', e);
    process.exit(-1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
