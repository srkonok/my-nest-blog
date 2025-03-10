import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    return next.handle().pipe(
      map(data => {
        // If data already has a statusCode property, use it as is
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }
        
        // Otherwise, wrap the response with statusCode
        return {
          statusCode: response.statusCode,
          data: data,
          message: data?.message || 'Success'
        };
      }),
    );
  }
} 