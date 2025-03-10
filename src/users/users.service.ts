import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  // Method to create a new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;
      return await this.userRepository.createUser(createUserDto);
    } catch (error) {
      throw new HttpException("Error creating user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Method to get all users
  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.getUserList();
    } catch (error) {
      throw new HttpException("Error fetching users", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Method to count total users
  async count(): Promise<number> {
    try {
      const users = await this.userRepository.getUserList();
      return users.length;
    } catch (error) {
      throw new HttpException("Error counting users", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Method to get a user by their ID
  async findOne(id: string): Promise<User> {
    try {
      // Check if id is a valid UUID or numeric ID
      const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/.test(id);
      
      if (!isValidId) {
        throw new HttpException(`Invalid user ID format: ${id}`, HttpStatus.BAD_REQUEST);
      }
      
      return await this.userRepository.getUserById(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
  }

  // Method to update a user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.userRepository.updateUser(updateUserDto, id);
    } catch (error) {
      throw new HttpException("Error updating user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Method to delete a user
  async remove(id: string): Promise<User | Error> {
    try {
      return await this.userRepository.deleteUser(id);
    } catch (error) {
      throw new HttpException("Error deleting user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Optional: Method to find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      throw new HttpException("Error finding user by email", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
