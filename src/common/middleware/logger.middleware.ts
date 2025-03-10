import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Log the request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);
    
    // Get the start time
    const start = Date.now();
    
    // Add a listener for when the response is finished
    res.on('finish', () => {
      // Calculate the response time
      const responseTime = Date.now() - start;
      
      // Get the status code
      const { statusCode } = res;
      
      // Determine log level based on status code
      if (statusCode >= 500) {
        this.logger.error(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);
      } else if (statusCode >= 400) {
        this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);
      }
    });
    
    next();
  }
} 