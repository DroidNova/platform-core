import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../types/api-response.type';

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<
  T,
  T | ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (this.shouldBypass(data)) {
          return data;
        }

        return {
          success: true,
          message: 'Request successful',
          data,
        };
      }),
    );
  }

  private shouldBypass(data: unknown): boolean {
    if (data instanceof StreamableFile || Buffer.isBuffer(data)) {
      return true;
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      typeof (data as { success?: unknown }).success === 'boolean'
    ) {
      return true;
    }

    return false;
  }
}
