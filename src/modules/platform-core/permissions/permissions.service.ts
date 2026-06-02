import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return {
      success: true,
      message: 'Permissions module is ready',
    };
  }

  async getPermissionsForRoleIds(roleIds: string[]): Promise<Record<string, string[]>> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      include: {
        permission: true,
      },
    });

    return rolePermissions.reduce<Record<string, string[]>>((acc: Record<string, string[]>, rolePermission: { roleId: string; permission: { name: string } }) => {
      const current = acc[rolePermission.roleId] ?? [];
      current.push(rolePermission.permission.name);
      acc[rolePermission.roleId] = current;
      return acc;
    }, {});
  }
}
