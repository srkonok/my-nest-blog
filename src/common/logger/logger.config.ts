import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

export function createLoggerOptions(configService: ConfigService): WinstonModuleOptions {
  const environment = configService.get('NODE_ENV', 'development');
  const logDir = configService.get('LOG_DIR', 'logs');
  const logLevel = configService.get('LOG_LEVEL', environment === 'production' ? 'info' : 'debug');
  
  // Define log formats
  const consoleFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('NestApp', {
      colors: true,
      prettyPrint: true,
    }),
  );
  
  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );
  
  // Create transports
  const transports: winston.transport[] = [
    // Console transport - always enabled
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel,
    }),
  ];
  
  // File transports - only in production or if explicitly enabled
  if (environment === 'production' || configService.get('ENABLE_FILE_LOGGING') === 'true') {
    // Add daily rotate file transport for combined logs
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: `${logDir}/application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: logLevel,
      }),
    );
    
    // Add daily rotate file transport for error logs
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: 'error',
      }),
    );
  }
  
  return {
    transports,
    // Default meta data for log messages
    defaultMeta: { 
      service: 'nest-api',
      environment,
    },
    // Global log level
    level: logLevel,
  };
} 