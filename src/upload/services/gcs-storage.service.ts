import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { File as FileEntity } from '../entities/file.entity';
import { StorageFile, StorageService, UploadedFileInfo } from '../interfaces/storage.interface';

@Injectable()
export class GcsStorageService implements StorageService {
  private readonly storage: Storage;
  private readonly bucket: string;
  private readonly projectId: string;
  private readonly logger = new Logger(GcsStorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.projectId = this.configService.get<string>('gcs.projectId');
    this.bucket = this.configService.get<string>('gcs.bucket');
    
    const clientEmail = this.configService.get<string>('gcs.clientEmail');
    const privateKey = this.configService.get<string>('gcs.privateKey');
    
    // Only create the storage client if all required config is present
    if (this.projectId && this.bucket && clientEmail && privateKey) {
      this.storage = new Storage({
        projectId: this.projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
      });
    } else {
      this.logger.warn('GCS configuration is incomplete. GCS storage will not be available.');
    }
  }

  private generateFileName(originalname: string): string {
    const fileExt = path.extname(originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    return fileName;
  }

  async uploadFile(file: StorageFile, userId: string, metadata?: Record<string, any>): Promise<UploadedFileInfo> {
    this.checkStorageAvailability();
    
    const fileName = this.generateFileName(file.originalname);
    const key = `uploads/${userId}/${fileName}`;
    
    const bucket = this.storage.bucket(this.bucket);
    const fileObject = bucket.file(key);
    
    const fileMetadata = {
      contentType: file.mimetype,
      metadata: {
        userId,
        originalName: file.originalname,
        ...(metadata || {}),
      },
    };
    
    await fileObject.save(file.buffer, {
      metadata: fileMetadata,
    });
    
    // Make the file publicly accessible
    await fileObject.makePublic();
    
    const url = `https://storage.googleapis.com/${this.bucket}/${key}`;
    
    return {
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: key,
      url,
    };
  }

  async getFile(fileEntity: FileEntity): Promise<Buffer> {
    this.checkStorageAvailability();
    
    try {
      const bucket = this.storage.bucket(this.bucket);
      const fileObject = bucket.file(fileEntity.path);
      
      const [fileContent] = await fileObject.download();
      return fileContent;
    } catch (error) {
      throw new NotFoundException(`File not found: ${fileEntity.originalName}`);
    }
  }

  async deleteFile(fileEntity: FileEntity): Promise<boolean> {
    this.checkStorageAvailability();
    
    try {
      const bucket = this.storage.bucket(this.bucket);
      const fileObject = bucket.file(fileEntity.path);
      
      await fileObject.delete();
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileEntity.path}:`, error);
      return false;
    }
  }

  async getFileUrl(fileEntity: FileEntity, expiresIn = 3600): Promise<string> {
    this.checkStorageAvailability();
    
    // If we already have a public URL, return it
    if (fileEntity.url && !expiresIn) {
      return fileEntity.url;
    }
    
    // Generate a signed URL
    try {
      const bucket = this.storage.bucket(this.bucket);
      const fileObject = bucket.file(fileEntity.path);
      
      const [url] = await fileObject.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      
      return url;
    } catch (error) {
      console.error(`Failed to generate signed URL for ${fileEntity.path}:`, error);
      return fileEntity.url || '';
    }
  }
  
  private checkStorageAvailability(): void {
    if (!this.storage) {
      throw new Error('Google Cloud Storage is not configured properly. Please check your environment variables.');
    }
  }
} 