import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { generateVersionDocs } from './version-docs';

// Define response schemas for Swagger
const responseSchemas = {
  SuccessResponse: {
    type: 'object',
    properties: {
      statusCode: {
        type: 'integer',
        example: 200,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'Success',
        description: 'Response message',
      },
      data: {
        type: 'object',
        description: 'Response data',
        example: {},
      },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      statusCode: {
        type: 'integer',
        example: 400,
        description: 'HTTP status code',
      },
      message: {
        type: 'string',
        example: 'Bad Request',
        description: 'Error message',
      },
      timestamp: {
        type: 'string',
        example: '2025-03-10T19:30:00.000Z',
        description: 'Timestamp when the error occurred',
      },
      path: {
        type: 'string',
        example: '/api/v1/users',
        description: 'Request path',
      },
      method: {
        type: 'string',
        example: 'GET',
        description: 'HTTP method',
      },
      error: {
        type: 'object',
        description: 'Additional error details',
        example: null,
      },
    },
  },
};

export function setupSwagger(app: INestApplication): void {
  const versionDocs = generateVersionDocs();
  
  const options = new DocumentBuilder()
    .setTitle('NestJS API Boilerplate')
    .setDescription('API documentation for the NestJS API Boilerplate')
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
    .addTag('posts', 'Blog post management endpoints')
    .addTag('files', 'File upload and management endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('api-versions', 'API versioning information')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  // Add global response schemas
  document.components = document.components || {};
  document.components.schemas = {
    ...document.components.schemas,
    ...responseSchemas,
  };
  
  // Add custom documentation for API versioning
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 1,
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