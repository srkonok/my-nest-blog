import { Injectable, Logger } from '@nestjs/common';
import { API_VERSIONS, ApiVersion, VersionInfo, VersionStatus } from '../constants/version.enum';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);

  constructor() {
    this.logVersionStatus();
  }

  /**
   * Get information about all API versions
   */
  getAllVersions(): Record<ApiVersion, VersionInfo> {
    return API_VERSIONS;
  }

  /**
   * Get information about a specific API version
   * @param version API version
   */
  getVersionInfo(version: ApiVersion): VersionInfo | undefined {
    return API_VERSIONS[version];
  }

  /**
   * Get the current recommended API version
   */
  getCurrentVersion(): ApiVersion | undefined {
    // V1 is now the current version
    return ApiVersion.V1;
  }

  /**
   * Check if a version is deprecated
   * @param version API version
   */
  isDeprecated(version: ApiVersion): boolean {
    const versionInfo = API_VERSIONS[version];
    return versionInfo?.status === VersionStatus.DEPRECATED || 
           versionInfo?.status === VersionStatus.SUNSET;
  }

  /**
   * Check if a version is removed
   * @param version API version
   */
  isRemoved(version: ApiVersion): boolean {
    const versionInfo = API_VERSIONS[version];
    return versionInfo?.status === VersionStatus.REMOVED;
  }

  /**
   * Log the status of all API versions
   */
  private logVersionStatus(): void {
    this.logger.log('API Version Status:');
    
    Object.entries(API_VERSIONS).forEach(([version, info]) => {
      const statusMessage = this.getStatusLogMessage(info);
      this.logger.log(`v${version}: ${statusMessage}`);
    });
  }

  /**
   * Get a formatted status message for logging
   * @param versionInfo Version information
   */
  private getStatusLogMessage(versionInfo: VersionInfo): string {
    const { status, releaseDate, deprecationDate, sunsetDate, removalDate } = versionInfo;
    
    let message = `${status.toUpperCase()} (Released: ${this.formatDate(releaseDate)})`;
    
    if (status === VersionStatus.DEPRECATED) {
      message += ` - Deprecated: ${this.formatDate(deprecationDate)}`;
      if (sunsetDate) {
        message += `, Sunset: ${this.formatDate(sunsetDate)}`;
      }
      if (removalDate) {
        message += `, Removal: ${this.formatDate(removalDate)}`;
      }
    } else if (status === VersionStatus.SUNSET) {
      message += ` - Sunset: ${this.formatDate(sunsetDate)}`;
      if (removalDate) {
        message += `, Removal: ${this.formatDate(removalDate)}`;
      }
    }
    
    return message;
  }

  /**
   * Format a date for logging
   * @param date Date to format
   */
  private formatDate(date?: Date): string {
    return date ? date.toISOString().split('T')[0] : 'N/A';
  }
} 