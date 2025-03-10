# NestJS REST API Boilerplate

A modern, production-ready NestJS REST API boilerplate with authentication, authorization, and best practices.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-Based Access Control (RBAC)
  - Password hashing with bcrypt
  - Token refresh mechanism
  - Public routes decorator

- **Error Handling & Validation**
  - Global exception filter
  - Request validation using class-validator
  - Consistent error responses

- **Database Integration**
  - TypeORM integration
  - Repository pattern
  - Base entity with common fields
  - Database migrations support

- **Security**
  - Helmet for HTTP headers security
  - CORS configuration
  - Response compression
  - Environment variable validation
  - Rate limiting with throttling

- **Documentation**
  - Swagger/OpenAPI documentation
  - API versioning

- **Email**
  - Email service integration
  - HTML email templates
  - Queue-based email sending with retries

- **Queue System**
  - Bull queue integration
  - Background job processing
  - Automatic retries with exponential backoff
  - Job monitoring and management

- **Logging System**
  - Winston-based logging with multiple transports
  - Log levels based on environment
  - HTTP request/response logging
  - Daily log rotation and archiving
  - Structured JSON logging for production
  - Pretty console output for development

- **Audit Logging**
  - Track all user actions and data changes
  - Automatic capture of request details
  - Sensitive data redaction
  - Asynchronous processing with queues
  - Admin interface for audit log review
  - Configurable retention policy

- **Health Checks**
  - Database health check
  - Memory usage monitoring
  - Disk space monitoring

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MySQL (v8 or later)
- Redis (v5 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nestjs-rest-boilerplate.git
   cd nestjs-rest-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

5. Start Redis (required for queues):
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 --name redis redis:alpine
   
   # Or use your system's package manager
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, production, test) | development |
| `PORT` | Port to run the server on | 3000 |
| `DATABASE_HOST` | Database host | localhost |
| `DATABASE_PORT` | Database port | 3306 |
| `DATABASE_USERNAME` | Database username | root |
| `DATABASE_PASSWORD` | Database password | |
| `DATABASE_NAME` | Database name | nest_db |
| `JWT_SECRET` | Secret for JWT tokens | |
| `JWT_EXPIRES_IN` | JWT token expiration | 1h |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d |
| `MAIL_HOST` | SMTP host | |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USER` | SMTP username | |
| `MAIL_PASSWORD` | SMTP password | |
| `MAIL_FROM` | Default sender email | |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `LOG_LEVEL` | Logging level | info (production), debug (development) |
| `LOG_DIR` | Directory for log files | logs |
| `ENABLE_FILE_LOGGING` | Enable logging to files | false |
| `ENABLE_AUDIT_LOGGING` | Enable audit logging | true |
| `AUDIT_LOG_RETENTION_DAYS` | Number of days to keep audit logs | 90 |
| `SERVER_URL` | Server URL for links in emails | |

## Logging

The application uses a robust logging system based on Winston with the following features:

- **Log Levels**: error, warn, info, http, verbose, debug, silly
- **Development Mode**: Pretty console output with colors
- **Production Mode**: JSON formatted logs for better parsing
- **Log Rotation**: Daily log files with automatic rotation and archiving
- **Separate Error Logs**: Critical errors are logged to a separate file

### Log Files

When file logging is enabled (`ENABLE_FILE_LOGGING=true`), logs are stored in the directory specified by `LOG_DIR` (default: `logs/`):

- `application-%DATE%.log` - All logs
- `error-%DATE%.log` - Error logs only

### Using the Logger

The custom logger is available throughout the application:

```typescript
// In a service or controller
constructor(private readonly logger: CustomLoggerService) {
  this.logger.setContext('YourClassName');
}

// Then use it
this.logger.log('This is an info message');
this.logger.error('This is an error message', stackTrace);
this.logger.warn('This is a warning message');
this.logger.debug('This is a debug message');
this.logger.verbose('This is a verbose message');
```

## Audit Logging

The application includes a comprehensive audit logging system to track user actions and data changes:

- **Automatic Tracking**: All API requests are automatically logged with user information
- **Data Change Tracking**: Records both old and new values for data modifications
- **Sensitive Data Protection**: Automatically redacts sensitive information like passwords
- **Asynchronous Processing**: Uses Bull queues for non-blocking audit logging
- **Flexible Querying**: Search audit logs by user, resource, action type, or date range
- **Admin Interface**: Dedicated endpoints for administrators to review audit logs

### Audit Log Fields

Each audit log entry includes:

- User ID and email
- Action type (create, update, delete, login, etc.)
- Resource type and ID
- Previous state (for updates/deletes)
- New state (for creates/updates)
- IP address and user agent
- Timestamp
- Additional metadata

### Using Audit Logging

The audit system works automatically for all API endpoints. You can also manually log actions:

```typescript
// In a service
constructor(private readonly auditService: AuditService) {}

// Log an action manually
await this.auditService.log({
  userId: user.id,
  userEmail: user.email,
  action: AuditActionType.PASSWORD_CHANGE,
  resource: 'user',
  resourceId: user.id,
  oldValue: { hasChangedPassword: false },
  newValue: { hasChangedPassword: true },
});
```

### Customizing Audit Logging

You can use decorators to customize audit logging for specific endpoints:

```typescript
// Specify the action type
@AuditAction(AuditActionType.LOGIN)
@Post('login')
async login() {
  // ...
}

// Specify the resource type
@AuditResource('user-settings')
@Put('settings')
async updateSettings() {
  // ...
}

// Skip audit logging for an endpoint
@SkipAudit()
@Get('health')
async healthCheck() {
  // ...
}
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── controllers/       # Auth controllers
│   ├── decorators/        # Custom decorators (Public, Roles)
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # Auth guards (JWT, Roles)
│   ├── strategies/        # Passport strategies
│   └── services/          # Auth services
├── common/                # Common code
│   ├── audit/             # Audit logging module
│   ├── entities/          # Base entities
│   ├── enums/             # Enums
│   ├── filters/           # Exception filters
│   ├── interceptors/      # Interceptors
│   ├── logger/            # Logging system
│   ├── middleware/        # Middleware
│   ├── pipes/             # Validation pipes
│   ├── processors/        # Queue processors
│   ├── repositories/      # Common repositories
│   ├── services/          # Common services
│   └── swagger/           # Swagger configuration
├── config/                # Configuration
├── health/                # Health check module
├── mail/                  # Mail module
│   ├── mail.module.ts     # Mail module definition
│   ├── mail.service.ts    # Mail service
│   ├── mail.processor.ts  # Queue processor for emails
│   └── mail-templates.service.ts # Email templates
├── users/                 # Users module
│   ├── controllers/       # User controllers
│   ├── dto/               # Data Transfer Objects
│   ├── entities/          # User entity
│   ├── repositories/      # User repositories
│   └── services/          # User services
├── app.controller.ts      # App controller
├── app.module.ts          # App module
├── app.service.ts         # App service
└── main.ts                # Application entry point
```

## Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start the application in watch mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Lint the code
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:generate` - Generate a migration
- `npm run migration:run` - Run migrations
- `npm run migration:revert` - Revert the last migration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
