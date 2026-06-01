import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = isHttp ? exception.getResponse() : 'Internal server error';

    if (!isHttp) {
      console.error(exception);
    }

    response.status(statusCode).json({
      success: false,
      error,
      meta: { timestamp: new Date().toISOString() },
    });
  }
}
