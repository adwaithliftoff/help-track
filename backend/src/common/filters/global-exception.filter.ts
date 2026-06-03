import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = isHttp ? exception.getResponse() : 'Internal server error';

    const { ip, method, url, requestId } = request;

    this.logger.error(
      {
        requestId,
        method,
        url,
        ip,
        statusCode,
        error,
      },
      !isHttp && exception instanceof Error ? exception.stack : undefined,
    );
    response.status(statusCode).json({
      success: false,
      error,
      meta: { timestamp: new Date().toISOString(), requestId },
    });
  }
}
