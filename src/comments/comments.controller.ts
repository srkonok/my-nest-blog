import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApiVersion } from 'src/common/constants/version.enum';

@ApiTags('comments')
@Controller({
  path: 'comments',
  version: ApiVersion.V1,
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments or comments for a specific post' })
  @ApiResponse({ status: 200, description: 'Return all comments', type: [Comment] })
  @ApiQuery({ name: 'postId', required: false, description: 'Filter comments by post ID' })
  findAll(@Query('postId') postId?: string) {
    if (postId) {
      return this.commentsService.findByPostId(postId);
    }
    return this.commentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({ status: 200, description: 'Return the comment', type: Comment })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'The comment has been created', type: Comment })
  create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User) {
    return this.commentsService.create({
      ...createCommentDto,
      userId: user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been updated', type: Comment })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been deleted' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
} 