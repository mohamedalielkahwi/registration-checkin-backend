import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger();
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    let returnedMessage = '';
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const exceptionRes =
      exception instanceof HttpException && exception.getResponse();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = (exceptionRes as any).message;

    if (Array.isArray(message)) returnedMessage = message[0];
    else returnedMessage = message;
    this.logger.error(
      `${new Date().toISOString()} - request method: ${
        request.method
      } request url${request.url} error:${returnedMessage}`,
    );

    return response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: returnedMessage,
    });
  }
}
