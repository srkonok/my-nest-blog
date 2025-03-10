import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(auditLogData: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.repository.create(auditLogData);
    return this.repository.save(auditLog);
  }

  async findById(id: string): Promise<AuditLog> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { userId },
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

  async findByResource(resource: string, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { resource },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, options?: { limit?: number; offset?: number }): Promise<[AuditLog[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
      },
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

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repository.delete({
      createdAt: LessThan(date),
    });
    
    return result.affected || 0;
  }
} 