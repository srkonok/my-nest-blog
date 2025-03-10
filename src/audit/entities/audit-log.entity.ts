import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum AuditActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  ACCESS = 'access',
  CUSTOM = 'custom',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: AuditActionType,
    default: AuditActionType.CUSTOM,
  })
  @Index()
  action: AuditActionType;

  @Column({ nullable: true })
  @Index()
  resource: string;

  @Column({ nullable: true })
  @Index()
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  newValue: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
} 