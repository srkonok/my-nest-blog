import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditCleanupTask {
  private readonly logger = new Logger(AuditCleanupTask.name);
  private readonly retentionDays: number;

  constructor(
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {
    this.retentionDays = this.configService.get<number>('audit.retentionDays', 90);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAuditLogs(): Promise<void> {
    this.logger.log(`Starting audit log cleanup (retention: ${this.retentionDays} days)`);
    
    try {
      const deletedCount = await this.auditService.cleanupOldLogs(this.retentionDays);
      this.logger.log(`Deleted ${deletedCount} old audit logs`);
    } catch (error) {
      this.logger.error(`Error cleaning up audit logs: ${error.message}`, error.stack);
    }
  }
} 