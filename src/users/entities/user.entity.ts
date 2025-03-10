// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'The unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @Column()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email of the user' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: true, description: 'Whether the user is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: Role.USER, description: 'The role of the user' })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  roles:Role[];
}