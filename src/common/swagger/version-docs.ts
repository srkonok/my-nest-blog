import { ApiVersion, API_VERSIONS, VersionStatus } from '../constants/version.enum';

/**
 * Generate Swagger documentation for API versioning
 */
export function generateVersionDocs() {
  const versionDocs = {
    name: 'API Versioning',
    description: `
# API Versioning

This API uses versioning to ensure backward compatibility while allowing for evolution of the API.

## Version Format

API versions are specified in the URL path:

\`\`\`
https://api.example.com/api/v{version}/{resource}
\`\`\`

For example:
- \`/api/v1/users\` - Version 1 of the users API
- \`/api/v2/users\` - Version 2 of the users API

## Available Versions

${Object.entries(API_VERSIONS)
  .map(([version, info]) => {
    const status = info.status.toUpperCase();
    const releaseDate = info.releaseDate.toISOString().split('T')[0];
    let versionInfo = `- **v${version}**: ${status} (Released: ${releaseDate})`;
    
    if (info.status === VersionStatus.DEPRECATED) {
      const deprecationDate = info.deprecationDate?.toISOString().split('T')[0];
      const removalDate = info.removalDate?.toISOString().split('T')[0];
      versionInfo += ` - Deprecated: ${deprecationDate}, Removal: ${removalDate}`;
    } else if (info.status === VersionStatus.SUNSET) {
      const removalDate = info.removalDate?.toISOString().split('T')[0];
      versionInfo += ` - Removal: ${removalDate}`;
    }
    
    return versionInfo;
  })
  .join('\n')}

## Version Lifecycle

1. **CURRENT**: The recommended version to use
2. **STABLE**: Fully supported version
3. **DEPRECATED**: Version that will be removed in the future
4. **SUNSET**: Version with minimal support, removal imminent
5. **REMOVED**: Version that has been removed

## Deprecation Headers

When using a deprecated API version, the following HTTP headers will be included in the response:

\`\`\`
Deprecation: true
Sunset: Sat, 01 Jan 2025 00:00:00 GMT
Link: </api/docs>; rel="deprecation"; type="text/html"
\`\`\`

## Version Information in Responses

All API responses include version information in the \`_meta\` field:

\`\`\`json
{
  "data": { ... },
  "_meta": {
    "version": {
      "number": "1",
      "status": "deprecated",
      "notice": "This version is deprecated and will be removed on January 1, 2025. Please migrate to V2.",
      "removalDate": "2025-01-01"
    }
  }
}
\`\`\`

## Migrating Between Versions

When migrating between versions, please refer to the API documentation for each endpoint to understand the changes.
`,
  };

  return versionDocs;
} 