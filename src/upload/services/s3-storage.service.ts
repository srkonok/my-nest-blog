import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { File } from '../entities/file.entity';
import { StorageFile, StorageService, UploadedFileInfo } from '../interfaces/storage.interface';

@Injectable()
export class S3StorageService implements StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly logger = new Logger(S3StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('aws.s3.region');
    this.bucket = this.configService.get<string>('aws.s3.bucket');
    
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    
    // Only create the S3 client if all required config is present
    if (this.region && this.bucket && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.logger.warn('AWS S3 configuration is incomplete. S3 storage will not be available.');
    }
  }

  private generateFileName(originalname: string): string {
    const fileExt = path.extname(originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    return fileName;
  }

  async uploadFile(file: StorageFile, userId: string, metadata?: Record<string, any>): Promise<UploadedFileInfo> {
    this.checkS3Availability();
    
    const fileName = this.generateFileName(file.originalname);
    const key = `uploads/${userId}/${fileName}`;
    
    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId,
        originalName: file.originalname,
        ...(metadata || {}),
      },
    };
    
    await this.s3Client.send(new PutObjectCommand(uploadParams));
    
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    
    return {
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: key,
      url,
    };
  }

  async getFile(fileEntity: File): Promise<Buffer> {
    this.checkS3Availability();
    
    try {
      const getParams = {
        Bucket: this.bucket,
        Key: fileEntity.path,
      };
      
      const response = await this.s3Client.send(new GetObjectCommand(getParams));
      
      // Convert readable stream to buffer
      if (!response.Body) {
        throw new NotFoundException(`File content not found: ${fileEntity.originalName}`);
      }
      
      // Use the transformToByteArray method from the SDK
      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      throw new NotFoundException(`File not found: ${fileEntity.originalName}`);
    }
  }

  async deleteFile(fileEntity: File): Promise<boolean> {
    this.checkS3Availability();
    
    try {
      const deleteParams = {
        Bucket: this.bucket,
        Key: fileEntity.path,
      };
      
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileEntity.path}:`, error);
      return false;
    }
  }

  async getFileUrl(fileEntity: File, expiresIn = 3600): Promise<string> {
    this.checkS3Availability();
    
    // If we already have a public URL, return it
    if (fileEntity.url && !expiresIn) {
      return fileEntity.url;
    }
    
    // Generate a pre-signed URL
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileEntity.path,
    });
    
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
  
  private checkS3Availability(): void {
    if (!this.s3Client) {
      throw new Error('AWS S3 is not configured properly. Please check your environment variables.');
    }
  }
} 