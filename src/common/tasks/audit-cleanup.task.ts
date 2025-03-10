import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuditCleanupTask {
  private readonly logger = new Logger(AuditCleanupTask.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Run daily at midnight to clean up old audit logs
   * based on the retention policy
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAuditLogs() {
    const enabled = this.configService.get<boolean>('audit.enabled', true);
    if (!enabled) {
      this.logger.debug('Audit logging is disabled, skipping cleanup');
      return;
    }

    const retentionDays = this.configService.get<number>('audit.retentionDays', 90);
    this.logger.log(`Starting cleanup of audit logs older than ${retentionDays} days`);

    try {
      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete logs older than the cutoff date
      const result = await this.auditLogRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      this.logger.log(`Successfully deleted ${result.affected || 0} old audit logs`);
    } catch (error) {
      this.logger.error(`Failed to clean up old audit logs: ${error.message}`, error.stack);
    }
  }
} 