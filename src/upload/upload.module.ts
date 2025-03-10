import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { File } from './entities/file.entity';
import { FileRepository } from './repositories/file.repository';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';
import { GcsStorageService } from './services/gcs-storage.service';
import { StorageFactoryService } from './services/storage-factory.service';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadController } from './controllers/file-upload.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(), // Use memory storage to handle files in memory
    }),
  ],
  controllers: [FileUploadController],
  providers: [
    FileRepository,
    LocalStorageService,
    S3StorageService,
    GcsStorageService,
    StorageFactoryService,
    FileUploadService,
  ],
  exports: [
    FileUploadService,
    FileRepository,
  ],
})
export class UploadModule {} 