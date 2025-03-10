import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AuditActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  FAILED_LOGIN = 'failed_login',
  ACCESS = 'access',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID who performed the action' })
  @Column({ nullable: true })
  @Index()
  userId: string;

  @ApiProperty({ description: 'User email who performed the action' })
  @Column({ nullable: true })
  userEmail: string;

  @ApiProperty({ description: 'Action type' })
  @Column({
    type: 'enum',
    enum: AuditActionType,
  })
  @Index()
  action: AuditActionType;

  @ApiProperty({ description: 'Resource type (e.g., user, post)' })
  @Column()
  @Index()
  resource: string;

  @ApiProperty({ description: 'Resource ID' })
  @Column({ nullable: true })
  @Index()
  resourceId: string;

  @ApiProperty({ description: 'Previous state (JSON)' })
  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @ApiProperty({ description: 'New state (JSON)' })
  @Column({ type: 'json', nullable: true })
  newValue: any;

  @ApiProperty({ description: 'IP address' })
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty({ description: 'User agent' })
  @Column({ nullable: true, length: 500 })
  userAgent: string;

  @ApiProperty({ description: 'Additional metadata (JSON)' })
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Timestamp' })
  @CreateDateColumn()
  @Index()
  createdAt: Date;
} 