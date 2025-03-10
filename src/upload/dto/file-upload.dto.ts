import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileStorageType } from '../entities/file.entity';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
  file: Express.Multer.File;

  @ApiPropertyOptional({ enum: FileStorageType, enumName: 'FileStorageType', description: 'Storage type for the file' })
  @IsOptional()
  @IsEnum(FileStorageType)
  storageType?: FileStorageType;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the file',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class FileResponseDto {
  @ApiProperty({ description: 'Unique identifier for the file' })
  id: string;

  @ApiProperty({ description: 'Original name of the file' })
  originalName: string;

  @ApiProperty({ description: 'Generated name of the file in storage' })
  fileName: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  size: number;

  @ApiProperty({ enum: FileStorageType, enumName: 'FileStorageType', description: 'Storage type for the file' })
  storageType: FileStorageType;

  @ApiProperty({ description: 'Path to the file in storage' })
  path: string;

  @ApiProperty({ description: 'URL to access the file' })
  url: string;

  @ApiProperty({ description: 'ID of the user who uploaded the file' })
  userId: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the file',
    type: 'object',
    additionalProperties: true
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Date when the file was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the file was last updated' })
  updatedAt: Date;
}

export class FileQueryDto {
  @ApiPropertyOptional({ description: 'Maximum number of files to return' })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Number of files to skip' })
  @IsOptional()
  offset?: number;
}

export class FileUrlDto {
  @ApiPropertyOptional({ description: 'Expiration time in seconds for the URL' })
  @IsOptional()
  expiresIn?: number;
}

export class FileIdParamDto {
  @ApiProperty({ description: 'ID of the file' })
  @IsUUID()
  @IsString()
  fileId: string;
} 