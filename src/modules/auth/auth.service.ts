import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, JwtPayload } from './types/jwt-payload.type';

type SafeUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret = process.env.JWT_ACCESS_SECRET ?? '';
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? '';
  private readonly jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
  private readonly jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    if (!this.jwtAccessSecret || !this.jwtRefreshSecret) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required');
    }
  }

  async register(registerDto: RegisterDto): Promise<{ success: true; user: SafeUser }> {
    const normalizedEmail = registerDto.email?.trim().toLowerCase();
    const normalizedPhone = registerDto.phone?.trim();

    if (!normalizedEmail && !normalizedPhone) {
      throw new BadRequestException('Either email or phone is required');
    }

    if (normalizedEmail) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingByEmail) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (normalizedPhone) {
      const existingByPhone = await this.prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (existingByPhone) {
        throw new ConflictException('Phone is already in use');
      }
    }

    const passwordHash = await this.hashData(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: registerDto.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const userRole = await this.prisma.role.findFirst({
      where: { name: 'USER' },
    });

    if (userRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    const freshUser = await this.getUserByIdOrThrow(user.id);

    return {
      success: true,
      user: this.toSafeUser(freshUser),
    };
  }

  async login(loginDto: LoginDto, userAgent?: string): Promise<AuthResponseDto> {
    const identity = loginDto.emailOrPhone.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identity }, { phone: loginDto.emailOrPhone.trim() }],
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.compareData(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is not active');
    }

    const initialRefreshTokenHash = await this.hashData(`${user.id}:${Date.now()}`);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: initialRefreshTokenHash,
        deviceName: loginDto.deviceName?.trim() || null,
        userAgent: userAgent || null,
        expiresAt: this.buildFutureDateFromDuration(this.jwtRefreshExpiresIn),
      },
    });

    const tokens = await this.generateTokens(user.id);
    const refreshTokenHash = await this.hashData(tokens.refreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash,
        expiresAt: this.buildFutureDateFromDuration(this.jwtRefreshExpiresIn),
      },
    });

    return {
      user: this.toSafeUser(user),
      tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const decoded = await this.verifyRefreshToken(refreshTokenDto.refreshToken);

    const user = await this.getUserByIdOrThrow(decoded.sub);

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is not active');
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!sessions.length) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let matchedSessionId: string | null = null;

    for (const session of sessions) {
      const isMatch = await this.compareData(refreshTokenDto.refreshToken, session.refreshTokenHash);

      if (isMatch) {
        matchedSessionId = session.id;
        break;
      }
    }

    if (!matchedSessionId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id);
    const newRefreshTokenHash = await this.hashData(tokens.refreshToken);

    await this.prisma.session.update({
      where: { id: matchedSessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: this.buildFutureDateFromDuration(this.jwtRefreshExpiresIn),
      },
    });

    return {
      user: this.toSafeUser(user),
      tokens,
    };
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<{ success: true; message: string }> {
    const decoded = await this.verifyRefreshToken(refreshTokenDto.refreshToken, true);

    if (!decoded) {
      return { success: true, message: 'Logged out successfully' };
    }

    const sessions = await this.prisma.session.findMany({
      where: { userId: decoded.sub },
      select: {
        id: true,
        refreshTokenHash: true,
      },
    });

    const matchingSession = await this.findMatchingSessionId(sessions, refreshTokenDto.refreshToken);

    if (matchingSession) {
      await this.prisma.session.delete({ where: { id: matchingSession } });
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.getUserByIdOrThrow(userId);

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is not active');
    }

    return this.toSafeUser(user);
  }

  async generateTokens(userId: string): Promise<AuthResponseDto['tokens']> {
    const payload: JwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtAccessSecret,
        expiresIn: this.jwtAccessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.durationToSeconds(this.jwtAccessExpiresIn),
    };
  }

  async hashData(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  async compareData(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }

  private async verifyRefreshToken(token: string, silent = false): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      if (silent) {
        return null;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getUserByIdOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
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

    return user;
  }

  private toSafeUser(user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    status: string;
    userRoles: Array<{ role: { name: string } }>;
  }): SafeUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.userRoles.map((userRole) => userRole.role.name),
    };
  }

  private durationToSeconds(value: string): number {
    const match = /^([0-9]+)(s|m|h|d)$/.exec(value);

    if (!match) {
      return 900;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    if (unit === 's') return amount;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 3600;
    return amount * 86400;
  }

  private buildFutureDateFromDuration(duration: string): Date {
    const seconds = this.durationToSeconds(duration);
    return new Date(Date.now() + seconds * 1000);
  }

  private async findMatchingSessionId(
    sessions: Array<{ id: string; refreshTokenHash: string }>,
    refreshToken: string,
  ): Promise<string | null> {
    for (const session of sessions) {
      const matched = await this.compareData(refreshToken, session.refreshTokenHash);
      if (matched) {
        return session.id;
      }
    }

    return null;
  }
}
