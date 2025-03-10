import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Comment, comment => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ type: 'simple-array', nullable: true })
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
} 