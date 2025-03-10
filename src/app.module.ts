import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { UploadModule } from './upload/upload.module';
import configuration, { validationSchema } from './config/configuration';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from './common/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { VersionModule } from './common/modules/version.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
    
    // Serve static files from uploads directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
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
    PostsModule,
    CommentsModule,
    HealthModule,
    UploadModule,
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
