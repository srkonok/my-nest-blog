import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The ID of the post this comment belongs to' })
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({ description: 'The ID of the parent comment (for replies)' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
} 