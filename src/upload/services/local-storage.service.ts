import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { File } from '../entities/file.entity';
import { StorageFile, StorageService, UploadedFileInfo } from '../interfaces/storage.interface';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
    
    // Ensure upload directory exists
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists(): Promise<void> {
    try {
      if (!await existsAsync(this.uploadDir)) {
        await mkdirAsync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  private generateFileName(originalname: string): string {
    const fileExt = path.extname(originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    return fileName;
  }

  async uploadFile(file: StorageFile, userId: string, metadata?: Record<string, any>): Promise<UploadedFileInfo> {
    await this.ensureUploadDirExists();
    
    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(this.uploadDir, fileName);
    
    await writeFileAsync(filePath, file.buffer);
    
    const relativePath = path.relative(process.cwd(), filePath);
    const url = `${this.baseUrl}/uploads/${fileName}`;
    
    return {
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      url,
    };
  }

  async getFile(fileEntity: File): Promise<Buffer> {
    const filePath = path.join(process.cwd(), fileEntity.path);
    
    try {
      return await readFileAsync(filePath);
    } catch (error) {
      throw new NotFoundException(`File not found: ${fileEntity.originalName}`);
    }
  }

  async deleteFile(fileEntity: File): Promise<boolean> {
    const filePath = path.join(process.cwd(), fileEntity.path);
    
    try {
      await unlinkAsync(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileEntity.path}:`, error);
      return false;
    }
  }

  async getFileUrl(fileEntity: File): Promise<string> {
    return fileEntity.url;
  }
} 