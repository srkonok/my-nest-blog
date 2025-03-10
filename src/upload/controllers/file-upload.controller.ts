import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { FileUploadService } from '../services/file-upload.service';
import {
  FileUploadDto,
  FileResponseDto,
  FileQueryDto,
  FileUrlDto,
  FileIdParamDto,
} from '../dto/file-upload.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { storageType?: string; metadata?: string },
    @CurrentUser() user: User,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Parse metadata if provided
    let metadata: Record<string, any> | undefined;
    if (body.metadata) {
      try {
        metadata = JSON.parse(body.metadata);
      } catch (error) {
        throw new BadRequestException('Invalid metadata format. Must be a valid JSON string.');
      }
    }

    // Convert file to StorageFile format
    const storageFile = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    };

    return this.fileUploadService.uploadFile(
      storageFile,
      user.id,
      body.storageType as any,
      metadata,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all files for the current user' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully', type: [FileResponseDto] })
  async getUserFiles(
    @CurrentUser() user: User,
    @Query() query: FileQueryDto,
  ): Promise<{ files: FileResponseDto[]; total: number }> {
    return this.fileUploadService.getUserFiles(user.id, {
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  async getFile(
    @Param() params: FileIdParamDto,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.fileUploadService.getFile(params.fileId);
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  }

  @Get(':fileId/url')
  @ApiOperation({ summary: 'Get a URL for a file' })
  @ApiResponse({ status: 200, description: 'File URL retrieved successfully' })
  async getFileUrl(
    @Param() params: FileIdParamDto,
    @Query() query: FileUrlDto,
  ): Promise<{ url: string }> {
    const url = await this.fileUploadService.getFileUrl(params.fileId, query.expiresIn);
    return { url };
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(
    @Param() params: FileIdParamDto,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    const success = await this.fileUploadService.deleteFile(params.fileId);
    return { success };
  }
} 