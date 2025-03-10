import { Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiVersion } from 'src/common/constants/version.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuditAction, AuditResource } from '../common/interceptors/audit.interceptor';
import { AuditActionType } from '../audit/entities/audit-log.entity';
import { VersionedController } from '../common/decorators/api-version.decorator';

@ApiTags('users')
@VersionedController(ApiVersion.V1, 'users')
@UseGuards(RolesGuard)
@AuditResource('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  @AuditAction(AuditActionType.CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all users.',
    type: [User] 
  })
  @AuditAction(AuditActionType.ACCESS)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  @AuditAction(AuditActionType.ACCESS)
  getProfile(@Request() req) {
    return { message: 'User profile', user: req.user };
  }

  @Get('about')
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user data' })
  @ApiResponse({ status: 200, description: 'Return user data.' })
  @AuditAction(AuditActionType.ACCESS)
  getUserData(@Request() req) {
    return { message: 'User Self data', user: req.user };
  }

  @Get('admin')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin data' })
  @ApiResponse({ status: 200, description: 'Return admin data.' })
  @AuditAction(AuditActionType.ACCESS)
  getAdminData(@Request() req) {
    return { message: 'Admin data', user: req.user };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the user.',
    type: User 
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @AuditAction(AuditActionType.ACCESS)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The user has been successfully updated.',
    type: User 
  })
  @AuditAction(AuditActionType.UPDATE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @AuditAction(AuditActionType.DELETE)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
