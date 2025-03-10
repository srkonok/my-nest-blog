import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { UsersV2Controller } from './users-v2.controller'; // Temporarily removed
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Register User entity
  providers: [UsersService, UserRepository],    // Register UsersService and UserRepository as providers
  controllers: [UsersController], // Removed UsersV2Controller
  exports: [UsersService],  // Optionally, export UsersService if needed elsewhere
})
export class UsersModule {}
