import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.originalUrl ?? request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - now;
          this.logger.log(`${method} ${url} ${delay}ms`);
        },
        error: () => {
          const delay = Date.now() - now;
          this.logger.warn(`${method} ${url} failed after ${delay}ms`);
        },
      }),
    );
  }
}
