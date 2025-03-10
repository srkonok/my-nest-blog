import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({ description: 'The content of the comment' })
  @IsString()
  @IsOptional()
  content?: string;
} 