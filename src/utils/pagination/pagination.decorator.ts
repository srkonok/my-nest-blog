import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function Paginate(options?: PaginationOptions): any {
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext): PaginationParams => {
      const request = ctx.switchToHttp().getRequest<Request>();
      
      const defaultPage = options?.defaultPage || DEFAULT_PAGE;
      const defaultLimit = options?.defaultLimit || DEFAULT_LIMIT;
      const maxLimit = options?.maxLimit || MAX_LIMIT;
      
      // Parse query parameters
      const page = Math.max(defaultPage, parseInt(request.query.page as string) || defaultPage);
      let limit = parseInt(request.query.limit as string) || defaultLimit;
      
      // Ensure limit doesn't exceed maximum
      limit = Math.min(limit, maxLimit);
      
      // Calculate offset for database queries
      const offset = (page - 1) * limit;
      
      return { page, limit, offset };
    },
  );
} 