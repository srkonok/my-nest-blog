import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content of the post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Whether the post is published', default: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
} 