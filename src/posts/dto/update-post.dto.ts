import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ description: 'The title of the post' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The content of the post' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Whether the post is published' })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
} 