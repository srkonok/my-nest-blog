import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let errorMessage: string;
    let errorDetails: any = null;

    if (typeof errorResponse === 'string') {
      errorMessage = errorResponse;
    } else if (typeof errorResponse === 'object') {
      errorMessage = (errorResponse as any).message || 'Internal server error';
      errorDetails = (errorResponse as any).error || null;
    } else {
      errorMessage = 'Internal server error';
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      ...(errorDetails && { error: errorDetails }),
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${errorMessage}`,
      errorDetails ? JSON.stringify(errorDetails) : '',
    );

    response.status(status).json(responseBody);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Default to internal server error
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let stack = exception.stack;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || message;
      } else if (typeof errorResponse === 'string') {
        message = errorResponse;
      }
    } else if (exception.message) {
      message = exception.message;
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // Add stack trace in development mode
    if (process.env.NODE_ENV !== 'production') {
      responseBody['stack'] = stack;
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      stack,
    );

    response.status(status).json(responseBody);
  }
} 