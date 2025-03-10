import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_VERSIONS, ApiVersion, VersionStatus } from '../constants/version.enum';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    
    // Extract version from the request URL
    // URL format: /api/v{version}/...
    const urlParts = request.url.split('/');
    const versionPart = urlParts.find(part => part.startsWith('v'));
    let version: ApiVersion | undefined;
    
    if (versionPart) {
      const versionNumber = versionPart.substring(1);
      version = versionNumber as ApiVersion;
    }
    
    // If version is found and it's deprecated, add deprecation headers
    if (version && API_VERSIONS[version]) {
      const versionInfo = API_VERSIONS[version];
      
      // Add version info to response headers
      response.header('X-API-Version', version);
      
      // Add deprecation headers if applicable
      if (versionInfo.status === VersionStatus.DEPRECATED || versionInfo.status === VersionStatus.SUNSET) {
        // RFC 8594 Deprecation header
        response.header('Deprecation', 'true');
        
        // Add Sunset header if sunset date is available
        if (versionInfo.sunsetDate) {
          response.header('Sunset', versionInfo.sunsetDate.toUTCString());
        }
        
        // Add Link header for documentation about the deprecation
        response.header('Link', '</api/docs>; rel="deprecation"; type="text/html"');
      }
    }
    
    return next.handle().pipe(
      map(data => {
        // If the response is an object, add version information
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Only add version info if version is found
          if (version && API_VERSIONS[version]) {
            const versionInfo = API_VERSIONS[version];
            
            // Add version metadata to the response
            return {
              ...data,
              _meta: {
                ...(data._meta || {}),
                version: {
                  number: version,
                  status: versionInfo.status,
                  ...(versionInfo.notice ? { notice: versionInfo.notice } : {}),
                  ...(versionInfo.status === VersionStatus.DEPRECATED && versionInfo.removalDate 
                    ? { removalDate: versionInfo.removalDate.toISOString().split('T')[0] } 
                    : {}),
                }
              }
            };
          }
        }
        return data;
      }),
    );
  }
} 