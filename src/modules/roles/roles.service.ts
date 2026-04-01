import { Injectable, NotFoundException } from '@nestjs/common';
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
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: uniqueNames,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (roles.length !== uniqueNames.length) {
      const foundNames = new Set(roles.map((role: { name: string }) => role.name));
      const missing = uniqueNames.filter((name) => !foundNames.has(name));
      throw new NotFoundException(`Roles not found: ${missing.join(', ')}`);
    }

    return roles;
  }
}
