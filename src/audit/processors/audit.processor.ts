import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog } from '../entities/audit-log.entity';

@Processor('audit-queue')
export class AuditProcessor {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  @Process('create-audit-log')
  async handleCreateAuditLog(job: Job<Partial<AuditLog>>): Promise<void> {
    this.logger.debug(`Processing audit log: ${JSON.stringify(job.data)}`);
    
    try {
      // Sanitize sensitive data
      const sanitizedData = this.sanitizeSensitiveData(job.data);
      
      // Create audit log
      await this.auditLogRepository.create(sanitizedData);
      
      this.logger.debug('Audit log created successfully');
    } catch (error) {
      this.logger.error(`Error creating audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  private sanitizeSensitiveData(data: Partial<AuditLog>): Partial<AuditLog> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card', 'ssn'];
    const sanitized = { ...data };
    
    // Sanitize old value
    if (sanitized.oldValue) {
      sanitized.oldValue = this.sanitizeObject(sanitized.oldValue, sensitiveFields);
    }
    
    // Sanitize new value
    if (sanitized.newValue) {
      sanitized.newValue = this.sanitizeObject(sanitized.newValue, sensitiveFields);
    }
    
    return sanitized;
  }

  private sanitizeObject(obj: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
    const sanitized = { ...obj };
    
    for (const key of Object.keys(sanitized)) {
      // Check if the key contains any sensitive field name
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeObject(sanitized[key], sensitiveFields);
      }
    }
    
    return sanitized;
  }
} 