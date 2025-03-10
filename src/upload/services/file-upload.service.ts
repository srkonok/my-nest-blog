import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageType } from '../entities/file.entity';
import { FileRepository } from '../repositories/file.repository';
import { StorageFactoryService } from './storage-factory.service';
import { StorageFile } from '../interfaces/storage.interface';

@Injectable()
export class FileUploadService {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly fileRepository: FileRepository,
    private readonly storageFactoryService: StorageFactoryService,
  ) {
    this.maxFileSize = this.configService.get<number>('upload.maxFileSize', 5 * 1024 * 1024); // 5MB default
    
    // Get allowed MIME types with a fallback
    const defaultMimeTypes = 'image/jpeg,image/png,image/gif,application/pdf';
    const configMimeTypes = this.configService.get<string>('upload.allowedMimeTypes');
    
    if (typeof configMimeTypes === 'string') {
      this.allowedMimeTypes = configMimeTypes.split(',').map(type => type.trim());
    } else {
      this.logger.warn('upload.allowedMimeTypes is not a string, using default values');
      this.allowedMimeTypes = defaultMimeTypes.split(',').map(type => type.trim());
    }
  }

  async uploadFile(file: StorageFile, userId: string, storageType?: FileStorageType, metadata?: Record<string, any>): Promise<any> {
    try {
      // Validate file
      this.validateFile(file);

      // Determine storage type
      let fileStorageType: FileStorageType;
      
      if (storageType) {
        fileStorageType = storageType;
      } else {
        const configStorageType = this.configService.get<string>('upload.destination', 'local');
        fileStorageType = (configStorageType?.toUpperCase() || 'LOCAL') as FileStorageType;
      }
      
      // Get appropriate storage service
      const storageService = this.storageFactoryService.getStorageService(fileStorageType);
      
      // Upload file to storage
      const uploadedFileInfo = await storageService.uploadFile(file, userId, metadata);
      
      // Save file metadata to database
      const fileEntity = await this.fileRepository.create({
        originalName: uploadedFileInfo.originalName,
        fileName: uploadedFileInfo.fileName,
        mimeType: uploadedFileInfo.mimeType,
        size: uploadedFileInfo.size,
        storageType: fileStorageType,
        path: uploadedFileInfo.path,
        url: uploadedFileInfo.url,
        userId,
        metadata,
      });
      
      return fileEntity;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(fileId: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    try {
      const fileEntity = await this.fileRepository.findById(fileId);
      
      if (!fileEntity) {
        throw new NotFoundException(`File with ID ${fileId} not found`);
      }
      
      const storageService = this.storageFactoryService.getStorageService(fileEntity.storageType);
      const buffer = await storageService.getFile(fileEntity);
      
      return {
        buffer,
        mimeType: fileEntity.mimeType,
        fileName: fileEntity.originalName,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error getting file ${fileId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get file: ${error.message}`);
    }
  }

  async getFileUrl(fileId: string, expiresIn?: number): Promise<string> {
    try {
      const fileEntity = await this.fileRepository.findById(fileId);
      
      if (!fileEntity) {
        throw new NotFoundException(`File with ID ${fileId} not found`);
      }
      
      const storageService = this.storageFactoryService.getStorageService(fileEntity.storageType);
      return storageService.getFileUrl(fileEntity, expiresIn);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error getting file URL ${fileId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get file URL: ${error.message}`);
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const fileEntity = await this.fileRepository.findById(fileId);
      
      if (!fileEntity) {
        throw new NotFoundException(`File with ID ${fileId} not found`);
      }
      
      const storageService = this.storageFactoryService.getStorageService(fileEntity.storageType);
      const deleted = await storageService.deleteFile(fileEntity);
      
      if (deleted) {
        await this.fileRepository.softDelete(fileId);
      }
      
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting file ${fileId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async getUserFiles(userId: string, options?: { limit?: number; offset?: number }): Promise<{ files: any[]; total: number }> {
    try {
      const [files, total] = await this.fileRepository.findByUserId(userId, options);
      return { files, total };
    } catch (error) {
      this.logger.error(`Error getting user files for ${userId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get user files: ${error.message}`);
    }
  }

  private validateFile(file: StorageFile): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds the maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }
    
    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
  }
} 