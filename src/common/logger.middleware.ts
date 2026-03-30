import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}
  private readonly logger = new Logger('RequestLogger');
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url, ip } = req;

    const start = Date.now();

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const responseTime = Date.now() - start;

      this.logger.log(
        `${method} ${url} ${statusCode} ${statusMessage} - ${ip} - ${responseTime}ms`,
      );
    });

    next();
  }
}
