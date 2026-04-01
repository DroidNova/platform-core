import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const;

type SeedRoleName = (typeof ROLE_NAMES)[number];

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run seeds');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const name of ROLE_NAMES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name: name as SeedRoleName,
      },
    });
  }
}

async function main(): Promise<void> {
  const prisma = createPrismaClient();

  try {
    await seedRoles(prisma);
    console.log('Role seed completed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('Role seed failed:', error);
  process.exit(1);
});
