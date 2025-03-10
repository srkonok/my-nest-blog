import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileStorageType } from '../entities/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private readonly repository: Repository<File>,
  ) {}

  async create(fileData: Partial<File>): Promise<File> {
    const file = this.repository.create(fileData);
    return this.repository.save(file);
  }

  async findById(id: string): Promise<File> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<[File[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByMimeType(mimeType: string, options?: { limit?: number; offset?: number }): Promise<[File[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { mimeType },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByStorageType(storageType: FileStorageType, options?: { limit?: number; offset?: number }): Promise<[File[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      where: { storageType },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<[File[], number]> {
    const { limit = 10, offset = 0 } = options || {};
    
    return this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, fileData: Partial<File>): Promise<File> {
    await this.repository.update(id, fileData);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
} 