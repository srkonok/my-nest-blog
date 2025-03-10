import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { generateVersionDocs } from './version-docs';

export function setupSwagger(app: INestApplication): void {
  const versionDocs = generateVersionDocs();
  
  const options = new DocumentBuilder()
    .setTitle('NestJS API Boilerplate')
    .setDescription('A RESTful API boilerplate built with NestJS')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('api-versions', 'API versioning information')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  // Add custom documentation for API versioning
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'NestJS API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    explorer: true,
  });
  
  // Set up a separate route for API versioning documentation
  app.use('/api/docs/versioning', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>API Versioning</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1, h2 { color: #333; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .version-current { color: green; font-weight: bold; }
            .version-stable { color: blue; }
            .version-deprecated { color: orange; }
            .version-sunset { color: red; }
            .version-removed { color: gray; text-decoration: line-through; }
          </style>
        </head>
        <body>
          <h1>API Versioning</h1>
          ${versionDocs.description}
        </body>
      </html>
    `);
  });
} 