import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AuditService } from '../services/audit.service';
import { AuditLogDto } from '../services/audit.service';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Processor('audit-queue')
export class AuditProcessor {
  constructor(
    private readonly auditService: AuditService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('AuditProcessor');
  }

  @Process('create-audit-log')
  async handleCreateAuditLog(job: Job<AuditLogDto>) {
    this.logger.debug(`Processing audit log job ${job.id}`);
    
    // Log the job data for debugging
    this.logger.debug(`Audit log data: ${JSON.stringify({
      userId: job.data.userId,
      userEmail: job.data.userEmail,
      action: job.data.action,
      resource: job.data.resource
    })}`);
    
    try {
      await this.auditService.createLog(job.data);
      this.logger.debug(`Audit log job ${job.id} completed successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to process audit log job ${job.id}`, error.stack);
      throw error;
    }
  }
} 