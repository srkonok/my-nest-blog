import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string) {
    context = context || this.context;
    
    if (typeof message === 'object') {
      const { message: msg, ...meta } = message;
      this.logger.info(msg as string, { context, ...meta });
    } else {
      this.logger.info(message, { context });
    }
  }

  error(message: any, trace?: string, context?: string) {
    context = context || this.context;
    
    if (typeof message === 'object' && message.message) {
      const { message: msg, stack, ...meta } = message;
      this.logger.error(msg, { context, stack: stack || trace, ...meta });
    } else {
      this.logger.error(message, { context, stack: trace });
    }
  }

  warn(message: any, context?: string) {
    context = context || this.context;
    
    if (typeof message === 'object') {
      const { message: msg, ...meta } = message;
      this.logger.warn(msg as string, { context, ...meta });
    } else {
      this.logger.warn(message, { context });
    }
  }

  debug(message: any, context?: string) {
    context = context || this.context;
    
    if (typeof message === 'object') {
      const { message: msg, ...meta } = message;
      this.logger.debug(msg as string, { context, ...meta });
    } else {
      this.logger.debug(message, { context });
    }
  }

  verbose(message: any, context?: string) {
    context = context || this.context;
    
    if (typeof message === 'object') {
      const { message: msg, ...meta } = message;
      this.logger.verbose(msg as string, { context, ...meta });
    } else {
      this.logger.verbose(message, { context });
    }
  }
} 