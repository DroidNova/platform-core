import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { RolesService } from '../roles/roles.service';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { ListAdminUsersDto } from './dto/list-admin-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';
const ADMIN_ROLE = 'ADMIN';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async listUsers(query: ListAdminUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const trimmedSearch = query.search?.trim();
    const where = trimmedSearch
      ? {
          OR: [
            { fullName: { contains: trimmedSearch, mode: 'insensitive' as const } },
            { email: { contains: trimmedSearch, mode: 'insensitive' as const } },
            { phone: { contains: trimmedSearch, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map((userRole: { role: { name: string } }) => userRole.role.name),
    };
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto, actor: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.assertCanModifyTargetUser({
      actorRoles: actor.roles,
      targetRoleNames: user.userRoles.map((userRole) => userRole.role.name),
    });

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async assignRoles(id: string, dto: AssignUserRolesDto, actor: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedRoleNames = Array.from(
      new Set(dto.roleNames.map((roleName) => roleName.trim()).filter(Boolean)),
    );

    if (!normalizedRoleNames.length) {
      throw new BadRequestException('At least one role name is required');
    }

    if (normalizedRoleNames.includes(SUPER_ADMIN_ROLE)) {
      throw new ForbiddenException('SUPER_ADMIN role can only be provisioned manually');
    }

    const isActorSuperAdmin = actor.roles.includes(SUPER_ADMIN_ROLE);
    const isPromotingToAdmin = normalizedRoleNames.includes(ADMIN_ROLE);

    if (isPromotingToAdmin && !isActorSuperAdmin) {
      throw new ForbiddenException('Only super admin can assign ADMIN role');
    }

    this.assertCanModifyTargetUser({
      actorRoles: actor.roles,
      targetRoleNames: user.userRoles.map((userRole) => userRole.role.name),
    });

    const roles = await this.rolesService.validateRoleNames(normalizedRoleNames);

    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    await this.prisma.userRole.createMany({
      data: roles.map((role) => ({ userId: id, roleId: role.id })),
      skipDuplicates: true,
    });

    return this.getUserById(id);
  }

  private assertCanModifyTargetUser(params: {
    actorRoles: string[];
    targetRoleNames: string[];
  }): void {
    const { actorRoles, targetRoleNames } = params;
    const isActorSuperAdmin = actorRoles.includes(SUPER_ADMIN_ROLE);
    const isTargetSuperAdmin = targetRoleNames.includes(SUPER_ADMIN_ROLE);
    const isTargetAdmin = targetRoleNames.includes(ADMIN_ROLE);

    if (isTargetSuperAdmin) {
      throw new ForbiddenException('SUPER_ADMIN account cannot be modified from admin APIs');
    }

    if (isTargetAdmin && !isActorSuperAdmin) {
      throw new ForbiddenException('Only super admin can modify admin accounts');
    }
  }
}
