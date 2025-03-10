import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Mail
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_DIR: Joi.string().default('logs'),
  ENABLE_FILE_LOGGING: Joi.boolean().default(false),

  // Audit
  ENABLE_AUDIT_LOGGING: Joi.boolean().default(true),
  AUDIT_LOG_RETENTION_DAYS: Joi.number().default(90),

  // File Upload
  UPLOAD_DESTINATION: Joi.string().default('local').valid('local', 's3', 'gcs'),
  UPLOAD_MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024), // 5MB
  UPLOAD_ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,image/gif,application/pdf'),
  
  // AWS S3
  AWS_S3_BUCKET: Joi.string().when('UPLOAD_DESTINATION', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_S3_REGION: Joi.string().when('UPLOAD_DESTINATION', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_ACCESS_KEY_ID: Joi.string().when('UPLOAD_DESTINATION', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('UPLOAD_DESTINATION', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  // Google Cloud Storage
  GCS_BUCKET: Joi.string().when('UPLOAD_DESTINATION', {
    is: 'gcs',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  GCS_PROJECT_ID: Joi.string().when('UPLOAD_DESTINATION', {
    is: 'gcs',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  GCS_CLIENT_EMAIL: Joi.string().when('UPLOAD_DESTINATION', {
    is: 'gcs',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  GCS_PRIVATE_KEY: Joi.string().when('UPLOAD_DESTINATION', {
    is: 'gcs',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // Server URL
  SERVER_URL: Joi.string().uri().required(),
});

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
  },
  audit: {
    enabled: process.env.ENABLE_AUDIT_LOGGING !== 'false',
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10) || 90,
  },
  upload: {
    destination: process.env.UPLOAD_DESTINATION || 'local',
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    localPath: 'uploads',
  },
  aws: {
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  gcs: {
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCS_PROJECT_ID,
    clientEmail: process.env.GCS_CLIENT_EMAIL,
    privateKey: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  server: {
    url: process.env.SERVER_URL,
  },
}); 