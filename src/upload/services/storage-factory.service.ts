import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageType } from '../entities/file.entity';
import { StorageService } from '../interfaces/storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { GcsStorageService } from './gcs-storage.service';

@Injectable()
export class StorageFactoryService {
  private readonly logger = new Logger(StorageFactoryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly gcsStorageService: GcsStorageService,
  ) {}

  getStorageService(storageType?: FileStorageType): StorageService {
    // If no storage type is provided, use the default from config
    if (!storageType) {
      const configStorageType = this.configService.get<string>('upload.destination', 'local');
      storageType = configStorageType.toUpperCase() as FileStorageType;
    }

    try {
      switch (storageType) {
        case FileStorageType.S3:
          return this.s3StorageService;
        case FileStorageType.GCS:
          return this.gcsStorageService;
        case FileStorageType.LOCAL:
        default:
          return this.localStorageService;
      }
    } catch (error) {
      this.logger.warn(`Error getting storage service for type ${storageType}: ${error.message}`);
      this.logger.warn('Falling back to local storage');
      return this.localStorageService;
    }
  }
} 