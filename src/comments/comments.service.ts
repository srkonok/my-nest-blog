import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {}

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['user', 'post'],
    });
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    // Verify post exists
    if (data.postId) {
      await this.postsService.findOne(data.postId);
    }
    
    const comment = this.commentRepository.create(data);
    return this.commentRepository.save(comment);
  }

  async update(id: string, data: Partial<Comment>): Promise<Comment> {
    await this.commentRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
} 