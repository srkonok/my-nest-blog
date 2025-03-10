import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApiVersion } from './common/constants/version.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get port from environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Enable URI-based Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API documentation with versioning')
    .setVersion(ApiVersion.V1) // Use version enum
    .addTag('users')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger with versioned URL
  SwaggerModule.setup(`api/v${ApiVersion.V1}`, app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}/api/v${ApiVersion.V1}`);
}

bootstrap();
