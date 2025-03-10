import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {} 