import { applyDecorators, Controller, Version } from '@nestjs/common';
import { ApiVersion, API_VERSIONS, VersionStatus } from '../constants/version.enum';
import { ApiExtraModels, ApiHeader, ApiResponse } from '@nestjs/swagger';

/**
 * Decorator to apply versioning to a controller
 * @param version API version to apply
 * @param path Controller path
 * @returns Decorator
 */
export function VersionedController(version: ApiVersion, path: string) {
  const versionInfo = API_VERSIONS[version];
  const decorators = [
    Controller({
      path,
      version,
    }),
    ApiHeader({
      name: 'X-API-Version',
      description: 'API Version',
      required: false,
      schema: { type: 'string', default: version },
    }),
  ];

  // Add deprecation information for Swagger if applicable
  if (versionInfo.status === VersionStatus.DEPRECATED || versionInfo.status === VersionStatus.SUNSET) {
    decorators.push(
      ApiResponse({
        status: 299,
        description: `Deprecation Notice: ${versionInfo.notice}`,
        headers: {
          Deprecation: {
            description: 'Indicates that the API version is deprecated',
            schema: { type: 'string', default: 'true' },
          },
          Sunset: {
            description: 'The date after which this API version will be removed',
            schema: { type: 'string', default: versionInfo.sunsetDate?.toUTCString() },
          },
          Link: {
            description: 'Link to documentation about the deprecation',
            schema: { type: 'string', default: '</api/docs>; rel="deprecation"; type="text/html"' },
          },
        },
      })
    );
  }

  return applyDecorators(...decorators);
} 