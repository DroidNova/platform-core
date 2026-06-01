import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes.constant';
import { ApiErrorResponse } from '../types/api-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.resolveMessage(exceptionResponse, exception);

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
    };

    response.status(statusCode).json(errorResponse);
  }

  private resolveMessage(
    exceptionResponse: string | object | null,
    exception: unknown,
  ): string {
    if (!exceptionResponse) {
      return exception instanceof Error
        ? exception.message
        : 'Internal server error';
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseMessage = (exceptionResponse as { message?: unknown })
        .message;
      if (Array.isArray(responseMessage)) {
        return String(responseMessage[0] ?? 'Request failed');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
    }

    return exception instanceof Error
      ? exception.message
      : 'Internal server error';
  }
}
