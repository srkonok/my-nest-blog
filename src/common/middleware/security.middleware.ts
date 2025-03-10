import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';

export function setupSecurity(app: INestApplication): void {
  // Use Helmet to set various HTTP headers for security
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use compression to reduce response size
  app.use(compression());
} 