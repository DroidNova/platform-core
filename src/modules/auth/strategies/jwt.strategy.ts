import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthenticatedUser, JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secretOrKey = process.env.JWT_ACCESS_SECRET;

    if (!secretOrKey) {
      throw new Error('JWT_ACCESS_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid access token');
    }

    const permissions: string[] = Array.from(
      new Set(
        user.userRoles.flatMap((userRole: { role: { rolePermissions: Array<{ permission: { name: string } }> } }) =>
          userRole.role.rolePermissions.map((rolePermission: { permission: { name: string } }) => rolePermission.permission.name),
        ),
      ),
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.userRoles.map((userRole: { role: { name: string } }) => userRole.role.name),
      permissions,
    };
  }
}
