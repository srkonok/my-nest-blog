import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VersionService } from '../services/version.service';
import { ApiVersion } from '../constants/version.enum';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('api-versions')
@Controller('api-versions')
@Public()
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all API versions information' })
  @ApiResponse({ status: 200, description: 'Returns information about all API versions' })
  getAllVersions() {
    return {
      versions: this.versionService.getAllVersions(),
      current: this.versionService.getCurrentVersion(),
    };
  }

  @Get(':version')
  @ApiOperation({ summary: 'Get information about a specific API version' })
  @ApiParam({ name: 'version', description: 'API version (e.g., v1, v2)' })
  @ApiResponse({ status: 200, description: 'Returns information about the specified API version' })
  @ApiResponse({ status: 404, description: 'API version not found' })
  getVersionInfo(@Param('version') versionParam: string) {
    // Remove 'v' prefix if present
    const version = versionParam.startsWith('v') 
      ? versionParam.substring(1) as ApiVersion
      : versionParam as ApiVersion;
    
    const versionInfo = this.versionService.getVersionInfo(version);
    
    if (!versionInfo) {
      throw new NotFoundException(`API version ${versionParam} not found`);
    }
    
    return {
      version: `v${version}`,
      ...versionInfo,
      releaseDate: versionInfo.releaseDate.toISOString().split('T')[0],
      deprecationDate: versionInfo.deprecationDate?.toISOString().split('T')[0],
      sunsetDate: versionInfo.sunsetDate?.toISOString().split('T')[0],
      removalDate: versionInfo.removalDate?.toISOString().split('T')[0],
    };
  }
} 