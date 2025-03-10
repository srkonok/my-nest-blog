import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        
    ) {}

    // Validate user by email and password
    async validateUser(email: string, password: string): Promise<Partial<User> | null> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // Login and return JWT token
    async login(user: { email: string; id: string; roles: string[] }) {
        const payload = { email: user.email, sub: user.id, roles: user.roles };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
            message: 'Login successful',
            status: 200, 
            refreshToken: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
                secret: process.env.JWT_REFRESH_SECRET || 'refreshsecretkey'
            }),
        };
    }

    async register(user: User) {
        return this.usersService.create(user);
    }

    async refreshToken(user: User) {
        const payload = { email: user.email, sub: user.id, roles: user.roles || [] };
        return {
            access_token: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { 
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_SECRET || 'refreshsecretkey'
            }),
            user: user,
            message: 'Token refreshed successfully',
            status: 200
        };
    }

}
