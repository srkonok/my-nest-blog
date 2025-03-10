import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuditModule } from './common/audit/audit.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { VersionModule } from './common/modules/version.module';
import configuration, { validationSchema } from './config/configuration';

@Module({
  imports: [
    // Load environment variables with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    
    // Configure TypeORM with values from .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 10,
      },
    ]),
    
    // Configure Bull for queue processing
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
        },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),
    
    // Logger module
    LoggerModule,
    
    // Audit module
    AuditModule,
    
    // Version module
    VersionModule,
    
    // Application modules
    UsersModule,
    AuthModule,
    MailModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
