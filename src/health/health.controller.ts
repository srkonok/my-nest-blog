import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';
import { ApiVersion } from 'src/common/constants/version.enum';
import { VersionedController } from 'src/common/decorators/api-version.decorator';

@VersionedController(ApiVersion.V1, 'health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    this.logger.log('Health check requested');
    
    return this.health.check([
      // Only check database connectivity for now
      async () => {
        try {
          this.logger.debug('Checking database connection');
          const result = await this.db.pingCheck('database');
          this.logger.debug('Database check successful');
          return result;
        } catch (error) {
          this.logger.error(`Database health check failed: ${error.message}`, error.stack);
          throw error;
        }
      },
    ]);
  }
} 