import { ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService hierarchy protections', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userRole: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockRolesService = {
    validateRoleNames: jest.fn(),
  };

  const service = new AdminService(mockPrisma as never, mockRolesService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks ADMIN from updating another ADMIN status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'target-admin',
      userRoles: [{ role: { name: 'ADMIN' } }],
    });

    await expect(
      service.updateUserStatus(
        'target-admin',
        { status: 'SUSPENDED' },
        {
          id: 'actor-admin',
          fullName: 'Admin Actor',
          email: 'admin@example.com',
          phone: null,
          status: 'ACTIVE',
          roles: ['ADMIN'],
          permissions: ['users.update'],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows SUPER_ADMIN to update ADMIN status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'target-admin',
      userRoles: [{ role: { name: 'ADMIN' } }],
    });
    mockPrisma.user.update.mockResolvedValue({ id: 'target-admin', status: 'SUSPENDED' });

    await expect(
      service.updateUserStatus(
        'target-admin',
        { status: 'SUSPENDED' },
        {
          id: 'actor-super-admin',
          fullName: 'Super Admin Actor',
          email: 'superadmin@example.com',
          phone: null,
          status: 'ACTIVE',
          roles: ['SUPER_ADMIN'],
          permissions: ['users.update'],
        },
      ),
    ).resolves.toEqual({ id: 'target-admin', status: 'SUSPENDED' });
  });

  it('blocks assigning SUPER_ADMIN role from admin API', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'target-user',
      userRoles: [{ role: { name: 'USER' } }],
    });

    await expect(
      service.assignRoles(
        'target-user',
        { roleNames: ['USER', 'SUPER_ADMIN'] },
        {
          id: 'actor-super-admin',
          fullName: 'Super Admin Actor',
          email: 'superadmin@example.com',
          phone: null,
          status: 'ACTIVE',
          roles: ['SUPER_ADMIN'],
          permissions: ['roles.assign'],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks ADMIN from assigning ADMIN role to users', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'target-user',
      userRoles: [{ role: { name: 'USER' } }],
    });

    await expect(
      service.assignRoles(
        'target-user',
        { roleNames: ['USER', 'ADMIN'] },
        {
          id: 'actor-admin',
          fullName: 'Admin Actor',
          email: 'admin@example.com',
          phone: null,
          status: 'ACTIVE',
          roles: ['ADMIN'],
          permissions: ['roles.assign'],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
