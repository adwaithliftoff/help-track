import 'dotenv/config';
import { seedMongo } from './mongo.seed';
import { seedPrisma } from './prisma.seed';

async function main() {
  if (process.env.DB === 'mongo') {
    await seedMongo();
  } else {
    await seedPrisma();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
