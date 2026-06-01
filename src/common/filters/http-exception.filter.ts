import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { ERROR_CODES, type ErrorCode } from '../constants/error-codes.constant';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiException) {
      const payload = exception.getResponse() as Record<string, unknown>;
      response.status(exception.getStatus()).json(payload);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const normalized = this.normalizeHttpException(
        status,
        exceptionResponse,
        exception,
      );
      response.status(status).json(normalized);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  private normalizeHttpException(
    status: number,
    body: string | object,
    exception: HttpException,
  ) {
    const responseBody = typeof body === 'string' ? { message: body } : body;
    const existingMessage = this.extractMessage(
      responseBody,
      exception.message,
    );
    const errors = this.extractErrors(responseBody);
    const existingCode = this.extractErrorCode(responseBody);

    const mappedCode = existingCode ?? this.mapStatusToCode(status, exception);

    return {
      success: false,
      message: existingMessage,
      errorCode: mappedCode,
      ...(errors ? { errors } : {}),
    };
  }

  private mapStatusToCode(status: number, exception: HttpException): ErrorCode {
    if (exception instanceof UnauthorizedException)
      return ERROR_CODES.UNAUTHORIZED;
    if (exception instanceof ForbiddenException) return ERROR_CODES.FORBIDDEN;
    if (exception instanceof NotFoundException) return ERROR_CODES.NOT_FOUND;
    if (exception instanceof ConflictException) return ERROR_CODES.CONFLICT;
    if (exception instanceof BadRequestException)
      return ERROR_CODES.BAD_REQUEST;
    if (status >= 500) return ERROR_CODES.INTERNAL_SERVER_ERROR;
    return ERROR_CODES.BAD_REQUEST;
  }

  private extractMessage(body: object, fallback: string): string {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string') return message;
    return fallback || 'Request failed';
  }

  private extractErrors(
    body: object,
  ): Record<string, unknown> | string[] | undefined {
    const errors = (body as { errors?: unknown }).errors;
    if (errors && (Array.isArray(errors) || typeof errors === 'object')) {
      return errors as Record<string, unknown> | string[];
    }
    return undefined;
  }

  private extractErrorCode(body: object): ErrorCode | undefined {
    const errorCode = (body as { errorCode?: unknown }).errorCode;
    return typeof errorCode === 'string' ? (errorCode as ErrorCode) : undefined;
  }
}
