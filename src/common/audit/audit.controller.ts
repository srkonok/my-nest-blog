import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { AuditLog, AuditActionType } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip' })
  @ApiResponse({ status: 200, description: 'Return all audit logs', type: [AuditLog] })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const [logs, total] = await this.auditService.findAll({ limit: +limit, offset: +offset });
    return {
      data: logs,
      meta: {
        total,
        limit: +limit || 10,
        offset: +offset || 0,
      },
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip' })
  @ApiResponse({ status: 200, description: 'Return audit logs for a user', type: [AuditLog] })
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const [logs, total] = await this.auditService.findByUser(userId, { limit: +limit, offset: +offset });
    return {
      data: logs,
      meta: {
        total,
        limit: +limit || 10,
        offset: +offset || 0,
      },
    };
  }

  @Get('resource/:resource')
  @ApiOperation({ summary: 'Get audit logs by resource type' })
  @ApiParam({ name: 'resource', description: 'Resource type (e.g., user, post)' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Resource ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip' })
  @ApiResponse({ status: 200, description: 'Return audit logs for a resource', type: [AuditLog] })
  async findByResource(
    @Param('resource') resource: string,
    @Query('resourceId') resourceId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const [logs, total] = await this.auditService.findByResource(
      resource,
      resourceId,
      { limit: +limit, offset: +offset },
    );
    return {
      data: logs,
      meta: {
        total,
        limit: +limit || 10,
        offset: +offset || 0,
      },
    };
  }

  @Get('action/:action')
  @ApiOperation({ summary: 'Get audit logs by action type' })
  @ApiParam({ name: 'action', description: 'Action type', enum: AuditActionType })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip' })
  @ApiResponse({ status: 200, description: 'Return audit logs for an action', type: [AuditLog] })
  async findByAction(
    @Param('action') action: AuditActionType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const [logs, total] = await this.auditService.findByAction(action, { limit: +limit, offset: +offset });
    return {
      data: logs,
      meta: {
        total,
        limit: +limit || 10,
        offset: +offset || 0,
      },
    };
  }
} 