import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { ip, method, url } = req;
    const before = Date.now();
    const requestId = randomUUID();
    req.requestId = requestId;
    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          requestId,
          method,
          url,
          ip,
          statusCode: res.statusCode,
          duration: Date.now() - before,
        });
      }),
    );
  }
}
