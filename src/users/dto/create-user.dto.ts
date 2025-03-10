// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'John Doe', 
    description: 'The name of the user' 
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'john@example.com', 
    description: 'The email of the user' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: true, 
    description: 'Whether the user is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

    @ApiProperty({ 
        example: Role.USER, 
        description: 'The role of the user',
        default: Role.USER
    })
  roles:Role[];
}