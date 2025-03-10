import { Injectable, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AuditService {
  private readonly isEnabled: boolean;

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly configService: ConfigService,
    @InjectQueue('audit-queue') private readonly auditQueue: Queue,
    @Optional() @Inject(REQUEST) private readonly request?: Request,
  ) {
    this.isEnabled = this.configService.get<boolean>('audit.enabled', true);
  }

  async log(auditData: Partial<AuditLog>): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // Add request metadata if available
    if (this.request) {
      auditData.ipAddress = this.request.ip;
      auditData.userAgent = this.request.headers['user-agent'];
    }

    // Add to queue for async processing
    await this.auditQueue.add('create-audit-log', auditData);
  }

  async createAuditLog(auditData: Partial<AuditLog>): Promise<AuditLog> {
    return this.auditLogRepository.create(auditData);
  }

  async findById(id: string): Promise<AuditLog> {
    return this.auditLogRepository.findById(id);
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findByUserId(userId, options);
    return { logs, total };
  }

  async findByAction(action: AuditActionType, options?: { limit?: number; offset?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findByAction(action, options);
    return { logs, total };
  }

  async findByResource(resource: string, options?: { limit?: number; offset?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findByResource(resource, options);
    return { logs, total };
  }

  async findByDateRange(startDate: Date, endDate: Date, options?: { limit?: number; offset?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findByDateRange(startDate, endDate, options);
    return { logs, total };
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAll(options);
    return { logs, total };
  }

  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    return this.auditLogRepository.deleteOlderThan(cutoffDate);
  }
} 