import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { VERSION_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const version =
      this.reflector.get(VERSION_METADATA, context.getHandler()) ??
      this.reflector.get(VERSION_METADATA, context.getClass());

    if (!version || version === '1' || version === VERSION_NEUTRAL) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: { version, timestamp: new Date().toISOString() },
      })),
    );
  }
}
