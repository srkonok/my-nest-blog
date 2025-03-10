/**
 * API Version identifiers
 */
export enum ApiVersion {
    V1 = '1',
    // V2 = '2', // Temporarily removed
  }
  
/**
 * API Version lifecycle status
 */
export enum VersionStatus {
  CURRENT = 'current',     // The current recommended version
  STABLE = 'stable',       // Stable version, fully supported
  DEPRECATED = 'deprecated', // Deprecated version, will be removed in the future
  SUNSET = 'sunset',       // Sunset version, minimal support, removal imminent
  REMOVED = 'removed',     // Version that has been removed
}

/**
 * API Version information including lifecycle status and dates
 */
export interface VersionInfo {
  version: ApiVersion;
  status: VersionStatus;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  removalDate?: Date;
  description: string;
  notice?: string;
}

/**
 * API Version registry with lifecycle information
 */
export const API_VERSIONS: Record<ApiVersion, VersionInfo> = {
  [ApiVersion.V1]: {
    version: ApiVersion.V1,
    status: VersionStatus.CURRENT, // Changed from DEPRECATED to CURRENT
    releaseDate: new Date('2023-01-01'),
    description: 'Current stable API version',
    // Removed deprecation information
  },
  // Temporarily removed V2
  // [ApiVersion.V2]: {
  //   version: ApiVersion.V2,
  //   status: VersionStatus.CURRENT,
  //   releaseDate: new Date('2023-07-01'),
  //   description: 'Current stable API version with enhanced security and performance',
  // },
};
  