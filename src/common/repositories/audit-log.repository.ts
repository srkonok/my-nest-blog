import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  private readonly logger = new Logger(AuditLogRepository.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    this.logger.debug(`Creating audit log: ${JSON.stringify({
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      action: auditLog.action,
      resource: auditLog.resource
    })}`);
    
    const log = this.repository.create(auditLog);
    
    try {
      const savedLog = await this.repository.save(log);
      this.logger.debug(`Audit log saved with ID: ${savedLog.id}`);
      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to save audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByResource(resource: string, resourceId?: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    const where: any = { resource };
    if (resourceId) {
      where.resourceId = resourceId;
    }
    
    return this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByAction(action: AuditActionType, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
} 