import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('PrismaClientExceptionFilter');

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getHttpStatusCode(exception.code);
    const message = this.getErrorMessage(exception);

    return response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message,
    });
  }

  private getHttpStatusCode(code: string): number {
    switch (code) {
      case 'P1010':
        return 403; // Forbidden
      case 'P2000':
        return 400; // Bad Request
      case 'P2002':
        return 409; // Conflict
      case 'P2003':
      case 'P2025':
        return 404; // Not Found
      default:
        return 400; // Bad Request
    }
  }

  private getErrorMessage(exception: PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P1010':
        return "User doesn't have access to the database";
      case 'P2000':
        return `The provided value for the column is too long for the column's type. Column: ${exception.meta.target} Given value: ${exception.meta.value},`;
      case 'P2002':
        return `The field ${exception.meta.target} should be unique`;
      case 'P2003':
        const regex = /Foreign key constraint failed on the field: (.+?)/;
        const match = regex.exec(exception.message);
        if (match) {
          return `The field ${match[1]} is invalid`;
        }
        break;
      case 'P2025':
        return exception.meta.cause.toString();
      default:
        return 'Sorry, something went wrong';
    }
  }
}
