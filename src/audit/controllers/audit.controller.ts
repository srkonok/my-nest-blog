import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuditService } from '../services/audit.service';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findAll({ limit, offset });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuditLog> {
    return this.auditService.findById(id);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByUserId(userId, { limit, offset });
  }

  @Get('action/:action')
  async findByAction(
    @Param('action') action: AuditActionType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByAction(action, { limit, offset });
  }

  @Get('resource/:resource')
  async findByResource(
    @Param('resource') resource: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByResource(resource, { limit, offset });
  }

  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      { limit, offset },
    );
  }
} 