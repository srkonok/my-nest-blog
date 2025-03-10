import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token123', description: 'The reset token' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'The new password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 