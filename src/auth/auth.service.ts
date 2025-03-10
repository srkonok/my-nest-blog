import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    // Store reset tokens temporarily (in a real app, use a database)
    private resetTokens: Map<string, { email: string, expires: Date }> = new Map();

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
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
            refreshToken: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
                secret: process.env.JWT_REFRESH_SECRET || 'refreshsecretkey'
            }),
        };
    }

    async register(registerDto: CreateUserDto) {
        return this.usersService.create(registerDto);
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

    async logout(user: User) {
        return {
            message: 'Logout successful',
            status: 200
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto, ipAddress?: string) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate a random token
        const token = randomBytes(32).toString('hex');
        
        // Store the token with expiration (1 hour)
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        this.resetTokens.set(token, { email: user.email, expires });

        // Send email with reset link
        await this.mailService.sendPasswordResetEmail(user, token, ipAddress);

        return {
            message: 'Password reset instructions sent to your email',
            status: 200
        };
    }

    async validateResetToken(token: string): Promise<boolean> {
        const tokenData = this.resetTokens.get(token);
        
        if (!tokenData) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (new Date() > tokenData.expires) {
            this.resetTokens.delete(token);
            throw new UnauthorizedException('Token has expired');
        }

        return true;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const tokenData = this.resetTokens.get(resetPasswordDto.token);
        
        if (!tokenData) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (new Date() > tokenData.expires) {
            this.resetTokens.delete(resetPasswordDto.token);
            throw new UnauthorizedException('Token has expired');
        }

        const user = await this.usersService.findByEmail(tokenData.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
        
        // Update user's password
        await this.usersService.update(user.id!, { password: hashedPassword });
        
        // Remove the used token
        this.resetTokens.delete(resetPasswordDto.token);

        // Send success email
        await this.mailService.sendPasswordResetSuccessEmail(user);

        return {
            message: 'Password has been reset successfully',
            status: 200
        };
    }

}
