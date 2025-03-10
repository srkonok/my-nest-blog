import { File } from '../entities/file.entity';

export interface StorageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname?: string;
  encoding?: string;
}

export interface UploadedFileInfo {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

export interface StorageService {
  /**
   * Upload a file to storage
   * @param file The file to upload
   * @param userId The ID of the user uploading the file
   * @param metadata Optional metadata to store with the file
   */
  uploadFile(file: StorageFile, userId: string, metadata?: Record<string, any>): Promise<UploadedFileInfo>;
  
  /**
   * Get a file from storage
   * @param fileEntity The file entity containing storage information
   */
  getFile(fileEntity: File): Promise<Buffer>;
  
  /**
   * Delete a file from storage
   * @param fileEntity The file entity containing storage information
   */
  deleteFile(fileEntity: File): Promise<boolean>;
  
  /**
   * Generate a URL for a file
   * @param fileEntity The file entity containing storage information
   * @param expiresIn Optional expiration time in seconds (for pre-signed URLs)
   */
  getFileUrl(fileEntity: File, expiresIn?: number): Promise<string>;
} 