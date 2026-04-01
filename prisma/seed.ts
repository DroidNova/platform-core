import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const ROLE_NAMES = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const;
const PERMISSIONS = [
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'roles.read',
  'roles.assign',
  'settings.read',
  'settings.update',
] as const;

const ROLE_PERMISSION_MAP: Record<(typeof ROLE_NAMES)[number], string[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: ['users.read', 'users.create', 'users.update', 'roles.read', 'settings.read'],
  USER: [],
};

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

async function seedPermissions(prisma: PrismaClient): Promise<void> {
  for (const name of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedRolePermissions(prisma: PrismaClient): Promise<void> {
  const roles = await prisma.role.findMany({
    where: { name: { in: [...ROLE_NAMES] } },
    select: { id: true, name: true },
  });

  const permissions = await prisma.permission.findMany({
    where: { name: { in: [...PERMISSIONS] } },
    select: { id: true, name: true },
  });

  const roleIdByName = new Map<string, string>(roles.map((role: { name: string; id: string }) => [role.name, role.id]));
  const permissionIdByName = new Map<string, string>(
    permissions.map((permission: { name: string; id: string }) => [permission.name, permission.id]),
  );

  for (const roleName of ROLE_NAMES) {
    const roleId = roleIdByName.get(roleName);

    if (!roleId) {
      continue;
    }

    const expectedPermissionIds = ROLE_PERMISSION_MAP[roleName]
      .map((permissionName) => permissionIdByName.get(permissionName))
      .filter((permissionId): permissionId is string => Boolean(permissionId));

    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        ...(expectedPermissionIds.length
          ? { permissionId: { notIn: expectedPermissionIds } }
          : {}),
      },
    });

    for (const permissionId of expectedPermissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  const prisma = createPrismaClient();

  try {
    await seedRoles(prisma);
    await seedPermissions(prisma);
    await seedRolePermissions(prisma);
    console.log('Role and permission seed completed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('Role/permission seed failed:', error);
  process.exit(1);
});
