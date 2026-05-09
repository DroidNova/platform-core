import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.resolveMessage(exceptionResponse, exception);

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
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
