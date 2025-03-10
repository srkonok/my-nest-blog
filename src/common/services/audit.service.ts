import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

export interface AuditLogDto {
  userId?: string;
  userEmail?: string;
  action: AuditActionType;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly enabled: boolean;

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly logger: CustomLoggerService,
    private readonly configService: ConfigService,
    @InjectQueue('audit-queue') private readonly auditQueue: Queue<AuditLogDto>,
  ) {
    this.logger.setContext('AuditService');
    this.enabled = this.configService.get<boolean>('audit.enabled', true);
  }

  /**
   * Log an action asynchronously using a queue
   */
  async log(auditLogDto: AuditLogDto): Promise<void> {
    // Skip if audit logging is disabled
    if (!this.enabled) {
      this.logger.debug('Audit logging is disabled, skipping log');
      return;
    }

    // Log the incoming audit data for debugging
    this.logger.debug(`Audit log request: ${JSON.stringify({
      userId: auditLogDto.userId,
      userEmail: auditLogDto.userEmail,
      action: auditLogDto.action,
      resource: auditLogDto.resource
    })}`);

    try {
      // Add to queue for async processing
      await this.auditQueue.add('create-audit-log', auditLogDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      });
      
      this.logger.debug(`Audit log queued: ${auditLogDto.action} on ${auditLogDto.resource}`);
    } catch (error) {
      this.logger.error(`Failed to queue audit log: ${error.message}`, error.stack);
      
      // Fallback: try to save directly if queueing fails
      try {
        await this.createLog(auditLogDto);
      } catch (fallbackError) {
        this.logger.error(`Failed to save audit log directly: ${fallbackError.message}`, fallbackError.stack);
      }
    }
  }

  /**
   * Create a log entry directly (used by the queue processor)
   */
  async createLog(auditLogDto: AuditLogDto): Promise<AuditLog> {
    try {
      // Clean sensitive data if present
      const cleanedDto = this.sanitizeLogData(auditLogDto);
      
      // Create the log entry
      const log = await this.auditLogRepository.create(cleanedDto);
      
      this.logger.debug(`Audit log created: ${log.id}`);
      return log;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find audit logs by user
   */
  async findByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findByUser(userId, options);
  }

  /**
   * Find audit logs by resource
   */
  async findByResource(resource: string, resourceId?: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findByResource(resource, resourceId, options);
  }

  /**
   * Find audit logs by action type
   */
  async findByAction(action: AuditActionType, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findByAction(action, options);
  }

  /**
   * Find all audit logs
   */
  async findAll(options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findAll(options);
  }

  /**
   * Remove sensitive information from log data
   */
  private sanitizeLogData(auditLogDto: AuditLogDto): AuditLogDto {
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'ssn'];
    
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = { ...obj };
      
      for (const key of Object.keys(result)) {
        const lowerKey = key.toLowerCase();
        
        // Check if this is a sensitive field
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof result[key] === 'object') {
          // Recursively sanitize nested objects
          result[key] = sanitize(result[key]);
        }
      }
      
      return result;
    };
    
    // Create a copy to avoid modifying the original
    const sanitizedDto = { ...auditLogDto };
    
    // Sanitize old and new values
    if (sanitizedDto.oldValue) {
      sanitizedDto.oldValue = sanitize(sanitizedDto.oldValue);
    }
    
    if (sanitizedDto.newValue) {
      sanitizedDto.newValue = sanitize(sanitizedDto.newValue);
    }
    
    // Sanitize metadata
    if (sanitizedDto.metadata) {
      sanitizedDto.metadata = sanitize(sanitizedDto.metadata);
    }
    
    return sanitizedDto;
  }
} 