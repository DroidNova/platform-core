import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const REQUIRED_ENV_KEYS = [
  'SUPER_ADMIN_FULL_NAME',
  'SUPER_ADMIN_EMAIL',
  'SUPER_ADMIN_PHONE',
  'SUPER_ADMIN_PASSWORD',
] as const;

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to bootstrap super admin');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

function getRequiredEnv(key: (typeof REQUIRED_ENV_KEYS)[number]): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required for super admin bootstrap`);
  }

  return value;
}

async function main(): Promise<void> {
  const fullName = getRequiredEnv('SUPER_ADMIN_FULL_NAME');
  const email = getRequiredEnv('SUPER_ADMIN_EMAIL').toLowerCase();
  const phone = getRequiredEnv('SUPER_ADMIN_PHONE');
  const password = getRequiredEnv('SUPER_ADMIN_PASSWORD');

  const prisma = createPrismaClient();

  try {
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: { name: 'SUPER_ADMIN' },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      include: {
        userRoles: true,
      },
    });

    if (existingUser) {
      const alreadyHasRole = existingUser.userRoles.some(
        (userRole) => userRole.roleId === superAdminRole.id,
      );

      if (!alreadyHasRole) {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleId: superAdminRole.id,
          },
        });
      }

      if (existingUser.status !== 'ACTIVE') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { status: 'ACTIVE' },
        });
      }

      console.log(`Super admin bootstrap skipped: user already exists (${existingUser.id}).`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        status: 'ACTIVE',
        userRoles: {
          create: {
            roleId: superAdminRole.id,
          },
        },
      },
    });

    console.log(`Super admin created successfully (${user.id}).`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('Super admin bootstrap failed:', error);
  process.exit(1);
});
