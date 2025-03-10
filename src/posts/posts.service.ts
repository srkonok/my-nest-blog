import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async create(data: CreatePostDto & { userId: string }): Promise<Post> {
    const post = this.postRepository.create(data);
    return this.postRepository.save(post);
  }

  async update(id: string, data: UpdatePostDto): Promise<Post> {
    await this.postRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.postRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
} 