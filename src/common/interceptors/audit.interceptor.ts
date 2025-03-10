import { Injectable, NestInterceptor, ExecutionContext, CallHandler, SetMetadata, Optional, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/services/audit.service';
import { AuditActionType } from '../../audit/entities/audit-log.entity';
import { Reflector } from '@nestjs/core';
import { CustomLoggerService } from '../logger/custom-logger.service';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AUDIT_RESOURCE_KEY = 'auditResource';
export const SKIP_AUDIT_KEY = 'skipAudit';

export const AuditAction = (action: AuditActionType) => SetMetadata(AUDIT_ACTION_KEY, action);
export const AuditResource = (resource: string) => SetMetadata(AUDIT_RESOURCE_KEY, resource);
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);

interface AuditMetadata {
  query?: any;
  url?: string;
  method?: string;
  duration?: number;
  status?: string;
  errorMessage?: string;
  errorCode?: number;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly defaultLogger = new Logger(AuditInterceptor.name);

  constructor(
    @Optional() private readonly auditService: AuditService,
    @Optional() private readonly reflector: Reflector,
    @Optional() private readonly customLogger: CustomLoggerService,
  ) {
    try {
      if (this.customLogger) {
        this.customLogger.setContext('AuditInterceptor');
      }
      
      if (!this.auditService) {
        this.getLogger().warn('AuditService is not available, audit logging will be disabled');
      }
    } catch (error) {
      // Fallback to console if everything fails
      console.warn('Error initializing AuditInterceptor logger:', error);
    }
  }

  private getLogger(): Logger | CustomLoggerService {
    try {
      return this.customLogger || this.defaultLogger;
    } catch (error) {
      // Fallback to console if everything fails
      console.warn('Error accessing logger:', error);
      return {
        log: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.debug,
        verbose: console.log,
      } as any;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      // Check if auditing should be skipped for this route
      let skipAudit = false;
      
      if (this.reflector) {
        skipAudit = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) || false;
      } else {
        this.getLogger().warn('Reflector is not available, audit metadata will not be used');
      }

      if (skipAudit) {
        return next.handle();
      }

      // Get HTTP context
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      const { method, url, body, params, query, headers } = request;
      
      // Extract user information
      const user = request.user;
      
      // Special handling for auth routes
      let userId = user?.id || user?.sub;
      let userEmail = user?.email;
      
      // For login route, extract user info from the response
      const isLoginRoute = url.includes('/auth/login') && method === 'POST';
      const isRegisterRoute = url.includes('/auth/register') && method === 'POST';
      const isLogoutRoute = url.includes('/auth/logout') && method === 'POST';
      
      if (isLoginRoute && body?.email) {
        userEmail = body.email;
        // Note: userId will be set after the response is received
      } else if (isRegisterRoute && body?.email) {
        userEmail = body.email;
        // Note: userId will be set after the response is received
      } else if (isLogoutRoute && user) {
        // For logout, we already have the user info from the JWT
        userId = user.id || user.sub;
        userEmail = user.email;
      }
      
      // Log detailed request information for debugging
      const logger = this.getLogger();
      logger.debug(`Processing request: ${method} ${url}`);
      if (user) {
        logger.debug(`User info: ${JSON.stringify(user)}`);
      } else {
        logger.debug('No user information available in request');
        if (isLoginRoute) {
          logger.debug(`Login attempt for email: ${userEmail}`);
        } else if (isRegisterRoute) {
          logger.debug(`Registration attempt for email: ${userEmail}`);
        }
      }

      // Get action and resource from decorators or infer from HTTP method
      let action = AuditActionType.CUSTOM;
      if (this.reflector) {
        action = this.reflector.getAllAndOverride<AuditActionType>(AUDIT_ACTION_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) || action;
      }

      if (!action) {
        // Infer action from HTTP method
        switch (method) {
          case 'POST':
            action = AuditActionType.CREATE;
            break;
          case 'PUT':
          case 'PATCH':
            action = AuditActionType.UPDATE;
            break;
          case 'DELETE':
            action = AuditActionType.DELETE;
            break;
          default:
            action = AuditActionType.ACCESS;
        }
      }

      // Get resource from decorator or infer from URL
      let resource = 'unknown';
      if (this.reflector) {
        resource = this.reflector.getAllAndOverride<string>(AUDIT_RESOURCE_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) || resource;
      }

      if (resource === 'unknown') {
        // Try to infer resource from URL
        const urlParts = url.split('/').filter(Boolean);
        if (urlParts.length > 0) {
          // Use the first part of the URL as the resource
          resource = urlParts[0];
        }
      }

      // Get resource ID from params
      const resourceId = params?.id;

      // Prepare audit log data
      const auditData = {
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        oldValue: method !== 'POST' ? params : undefined,
        newValue: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined,
        ipAddress: request.ip || request.connection?.remoteAddress,
        userAgent: headers['user-agent'],
        metadata: {
          query,
          url,
          method,
        } as AuditMetadata,
      };

      // Log the audit data being prepared
      logger.debug(`Audit data prepared: ${JSON.stringify({
        userId: auditData.userId,
        userEmail: auditData.userEmail,
        action: auditData.action,
        resource: auditData.resource,
        resourceId: auditData.resourceId
      })}`);

      // Start timing the request
      const start = Date.now();

      return next.handle().pipe(
        tap({
          next: (data) => {
            try {
              // Request was successful
              const duration = Date.now() - start;
              
              // Update the audit data with the response
              auditData.metadata = {
                ...auditData.metadata,
                duration,
                status: 'success',
              } as AuditMetadata;
              
              // If this was a GET request with a specific ID, store the result as oldValue
              if (method === 'GET' && resourceId && data) {
                auditData.oldValue = data;
              }
              
              // For auth routes, extract user ID from the response
              if (isLoginRoute && data?.user?.id) {
                auditData.userId = data.user.id;
              } else if (isRegisterRoute && data?.id) {
                auditData.userId = data.id;
              }
              
              // Log the action if audit service is available
              if (this.auditService) {
                this.auditService.log(auditData).catch(error => {
                  this.getLogger().error(`Failed to log audit: ${error.message}`, error.stack);
                });
              }
            } catch (error) {
              console.error('Error in audit interceptor success handler:', error);
            }
          },
          error: (error) => {
            try {
              // Request failed
              const duration = Date.now() - start;
              
              // Update the audit data with the error
              auditData.metadata = {
                ...auditData.metadata,
                duration,
                status: 'error',
                errorMessage: error.message,
                errorCode: error.status || 500,
              } as AuditMetadata;
              
              // Log the action if audit service is available
              if (this.auditService) {
                this.auditService.log(auditData).catch(logError => {
                  this.getLogger().error(`Failed to log audit: ${logError.message}`, logError.stack);
                });
              }
            } catch (logError) {
              console.error('Error in audit interceptor error handler:', logError);
            }
          },
        }),
      );
    } catch (error) {
      console.error('Error in audit interceptor:', error);
      return next.handle(); // Continue the request chain even if audit fails
    }
  }
} 