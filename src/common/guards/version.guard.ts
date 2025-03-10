import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { API_VERSIONS, ApiVersion, VersionStatus } from '../constants/version.enum';

@Injectable()
export class VersionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Extract version from the request URL
    // URL format: /api/v{version}/...
    const urlParts = request.url.split('/');
    const versionPart = urlParts.find(part => part.startsWith('v'));
    
    if (!versionPart) {
      // No version specified, allow access (will use default version)
      return true;
    }
    
    const versionNumber = versionPart.substring(1);
    const version = versionNumber as ApiVersion;
    
    // Check if version exists
    if (!API_VERSIONS[version]) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `API version v${version} does not exist`,
          message: 'Please use a valid API version',
          availableVersions: Object.keys(API_VERSIONS).map(v => `v${v}`),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    
    const versionInfo = API_VERSIONS[version];
    
    // Check if version is removed
    if (versionInfo.status === VersionStatus.REMOVED) {
      throw new HttpException(
        {
          status: HttpStatus.GONE,
          error: `API version v${version} has been removed`,
          message: versionInfo.notice || 'This API version has been removed. Please upgrade to a newer version.',
          currentVersion: Object.entries(API_VERSIONS)
            .find(([_, info]) => info.status === VersionStatus.CURRENT)?.[0],
        },
        HttpStatus.GONE,
      );
    }
    
    // Check if version is sunset
    if (versionInfo.status === VersionStatus.SUNSET) {
      // Allow access but with a warning (handled by interceptor)
      // Could also throw an exception if you want to be more strict
      return true;
    }
    
    // All other statuses (CURRENT, STABLE, DEPRECATED) are allowed
    return true;
  }
} 