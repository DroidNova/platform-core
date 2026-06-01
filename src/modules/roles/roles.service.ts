import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return {
      success: true,
      message: 'Roles module is ready',
    };
  }

  async validateRoleNames(roleNames: string[]): Promise<Array<{ id: string; name: string }>> {
    const uniqueNames = Array.from(new Set(roleNames));
    const allowedRoleNames = new Set<RoleName>(Object.values(RoleName));
    const uniqueRoleNames = uniqueNames.filter((name): name is RoleName =>
      allowedRoleNames.has(name as RoleName),
    );

    if (uniqueRoleNames.length !== uniqueNames.length) {
      const missing = uniqueNames.filter((name) => !allowedRoleNames.has(name as RoleName));
      throw new NotFoundException(`Roles not found: ${missing.join(', ')}`);
    }

    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: uniqueRoleNames,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (roles.length !== uniqueRoleNames.length) {
      const foundNames = new Set(roles.map((role: { name: string }) => role.name));
      const missing = uniqueRoleNames.filter((name) => !foundNames.has(name));
      throw new NotFoundException(`Roles not found: ${missing.join(', ')}`);
    }

    return roles;
  }
}
