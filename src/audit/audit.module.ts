import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditService } from './services/audit.service';
import { AuditProcessor } from './processors/audit.processor';
import { AuditController } from './controllers/audit.controller';
import { AuditCleanupTask } from './tasks/audit-cleanup.task';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({
      name: 'audit-queue',
    }),
  ],
  providers: [AuditLogRepository, AuditService, AuditProcessor, AuditCleanupTask],
  exports: [AuditService],
  controllers: [AuditController],
})
export class AuditModule {} 