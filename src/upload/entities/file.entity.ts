import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum FileStorageType {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
}

@Entity('files')
export class File {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Original file name' })
  @Column()
  originalName: string;

  @ApiProperty({ description: 'File name in storage' })
  @Column()
  fileName: string;

  @ApiProperty({ description: 'MIME type' })
  @Column()
  @Index()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column()
  size: number;

  @ApiProperty({ description: 'Storage type (local, s3, gcs)' })
  @Column({
    type: 'enum',
    enum: FileStorageType,
    default: FileStorageType.LOCAL,
  })
  @Index()
  storageType: FileStorageType;

  @ApiProperty({ description: 'Storage path or key' })
  @Column()
  path: string;

  @ApiProperty({ description: 'Public URL to access the file' })
  @Column({ nullable: true })
  url: string;

  @ApiProperty({ description: 'User ID who uploaded the file' })
  @Column({ nullable: true })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Additional metadata (JSON)' })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion timestamp' })
  @DeleteDateColumn()
  deletedAt: Date;
} 