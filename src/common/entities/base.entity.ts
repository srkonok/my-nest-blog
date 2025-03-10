// src/common/entities/base.entity.ts
import { 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity as TypeOrmBaseEntity
  } from 'typeorm';
  
  export abstract class BaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
  
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt: Date;
  }