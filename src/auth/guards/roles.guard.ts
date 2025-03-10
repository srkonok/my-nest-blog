import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // If no user or no roles, deny access
    if (!user || !user.roles) {
      this.logger.warn(`Access denied: No user or roles found in request`);
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    
    if (!hasRole) {
      this.logger.warn(`Access denied: User ${user.email} with roles [${user.roles}] attempted to access resource requiring roles [${requiredRoles}]`);
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    
    return true;
  }
}
