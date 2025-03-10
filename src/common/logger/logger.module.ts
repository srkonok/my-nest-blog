import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createLoggerOptions } from './logger.config';
import { CustomLoggerService } from './custom-logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createLoggerOptions,
    }),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {} 