import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiVersion } from 'src/common/constants/version.enum';

@ApiTags('posts')
@Controller({
  path: 'posts',
  version: ApiVersion.V1,
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts', type: [PostEntity] })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({ status: 200, description: 'Return the post', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'The post has been created', type: PostEntity })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create({
      ...createPostDto,
      userId: user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'The post has been updated', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'The post has been deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
} 