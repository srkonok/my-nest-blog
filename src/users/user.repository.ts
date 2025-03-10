import {
    HttpException,
    HttpStatus,
    Injectable,
  } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

  // import { Error } from "rxjs";  // Removed as it does not exist in rxjs
  
  @Injectable()
  export class UserRepository {
    constructor(
      @InjectRepository(User)
      private readonly repo: Repository<User>
    ) {}
  
    // Method to create a new user
    async createUser(body: CreateUserDto): Promise<User> {
      try {
        const resData = removeEmptyValues(body);  // Filter out empty fields from the DTO
  
        const entity = this.repo.create(resData);  // Create a new user entity
        await this.repo.save(entity);  // Save the entity to the database
        return entity;  // Return the created user
      } catch (error) {
        console.error("Error creating User:", error);
        throw new HttpException("Error creating User", HttpStatus.INTERNAL_SERVER_ERROR);  // Handle errors
      }
    }
  
    // Method to get a list of all users
    async getUserList(): Promise<User[]> {
      try {
        const resData = await this.repo.find({
          order: { createdAt: -1 },  // Order by the creation date in descending order
          where: { deletedAt: null },  // Filter out deleted users
        });
        return resData;  // Return the list of users
      } catch (error) {
        console.error("Error fetching User list:", error);
        throw new HttpException("Error fetching User list", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    // Method to get a user by their ID
    async getUserById(id: string): Promise<User> {
      try {
        return await this.repo.findOneOrFail({ where: { id } });  // Throw error if not found
      } catch (error) {
        console.error("Error fetching User by ID:", error);
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
    }
  
    // Method to update a user
    async updateUser(body: UpdateUserDto, id: string): Promise<User> {
      try {
        const updateResult = await this.repo.update(id, removeEmptyValues(body));  // Update user fields, excluding empty ones
        if (updateResult.affected === 0) {
          throw new HttpException(`No User found with id: ${id}`, HttpStatus.NOT_FOUND);  // Handle if no user is updated
        }
        const updatedUser = await this.repo.findOneOrFail({ where: { id } });  // Fetch the updated user
        return updatedUser;
      } catch (error) {
        console.error("Error updating User:", error);
        throw new HttpException("Error updating User", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    // Method to delete a user
    async deleteUser(id: string): Promise<User | Error> {
      try {
        const entity = await this.repo.findOne({ where: { id } });  // Find user by ID
        if (!entity) {
          return new Error("No record found with this id");  // Handle case when user is not found
        }
        entity.deletedAt = new Date();  // Mark the user as deleted
        return await this.repo.save(entity);  // Save the updated user
      } catch (error) {
        console.error("Error deleting User:", error);
        throw new HttpException("Error deleting User", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    // Optional: Method to find a user by email
    async findByEmail(email: string): Promise<User | undefined> {
      try {
        return await this.repo.findOne({ where: { email } });
      } catch (error) {
        console.error("Error finding User by email:", error);
        throw new HttpException("Error finding User by email", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
    function removeEmptyValues<T extends CreateUserDto | UpdateUserDto>(body: T): Partial<T> {
            const cleanedBody: Partial<T> = {};
        for (const key in body) {
            if (body[key] !== null && body[key] !== undefined && body[key] !== '') {
                cleanedBody[key] = body[key];
            }
        }
        return cleanedBody;
    }
  