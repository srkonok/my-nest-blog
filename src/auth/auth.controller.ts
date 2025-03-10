import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    // @Post('login')
    // async login(@Body() body: { email: string; password: string }) {
    //     const user = await this.authService.validateUser(body.email, body.password);
    //     if (!user) {
    //         throw new UnauthorizedException('Invalid credentials');
    //     }
    //     return this.authService.login({
    //         email: user.email!,
    //         id: user.id!,
    //         roles: user.roles || [],
    //     });
    // }
}
