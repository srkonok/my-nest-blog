import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('ExceptionHandler');
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    const responseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add stack trace in development mode
    if (process.env.NODE_ENV !== 'production' && exception.stack) {
      responseBody['stack'] = exception.stack;
    }

    // Log the error with appropriate context and metadata
    const errorLog = {
      message: `${request.method} ${request.url} - ${status} - ${message}`,
      exception: exception.name || 'Error',
      stack: exception.stack,
      body: request.body,
      params: request.params,
      query: request.query,
      user: request.user,
      path: request.url,
      statusCode: status,
    };

    this.logger.error(errorLog);

    response.status(status).json(responseBody);
  }
} 