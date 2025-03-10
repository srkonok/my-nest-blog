import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { setupSwagger } from './common/swagger/swagger.config';
import { setupSecurity } from './common/middleware/security.middleware';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Ensure logs directory exists
  const logDir = process.env.LOG_DIR || 'logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Create the application with custom logger
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is available
  });
  
  // Get services
  const configService = app.get(ConfigService);
  const logger = app.get(CustomLoggerService);
  logger.setContext('Bootstrap');
  
  // Use custom logger for application logging
  app.useLogger(logger);
  
  const port = configService.get('port') || 3000;

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Setup security middleware
  setupSecurity(app);

  // Setup global validation pipe
  app.useGlobalPipes(createValidationPipe());

  // Apply transform interceptor globally
  app.useGlobalInterceptors(new TransformInterceptor());

  // Apply exception filters globally
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter()
  );

  // Setup Swagger documentation
  setupSwagger(app);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap().catch(err => {
  console.error('Error starting application:', err);
  process.exit(1);
});
