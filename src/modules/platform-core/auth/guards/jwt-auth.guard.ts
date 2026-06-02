import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';
import { ApiException } from '../../../../common/exceptions/api.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: { message?: string; name?: string } | undefined,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (user) return user as TUser;

    if (info?.name === 'TokenExpiredError') {
      throw new ApiException(
        'Your session has expired. Please login again.',
        401,
        ERROR_CODES.SESSION_EXPIRED,
      );
    }

    if (
      info?.message === 'No auth token' ||
      info?.message === 'No authorization token was found'
    ) {
      throw new ApiException(
        'Authentication token is missing',
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    if (err instanceof UnauthorizedException) {
      throw new ApiException(
        'Invalid authentication token',
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    throw new ApiException(
      'Invalid authentication token',
      401,
      ERROR_CODES.UNAUTHORIZED,
    );
  }
}
