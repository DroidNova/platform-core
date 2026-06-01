import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, type ErrorCode } from '../constants/error-codes.constant';

export class ApiException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    errorCode: ErrorCode,
    errors?: Record<string, unknown> | string[],
  ) {
    super(
      {
        success: false,
        message,
        errorCode,
        ...(errors ? { errors } : {}),
      },
      status,
    );
  }

  static internalServerError() {
    return new ApiException(
      'Something went wrong. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
