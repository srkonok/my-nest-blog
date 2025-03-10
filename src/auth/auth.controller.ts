import { Controller, Post, Body, UnauthorizedException, Get, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { ApiVersion } from 'src/common/constants/version.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Controller({
    path: 'auth',
    version: ApiVersion.V1,
})
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
    ) {}



    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'The user has been successfully logged in.', type: User })
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login({
            email: user.email!,
            id: user.id!,
            roles: user.roles || [],
        });
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 200, description: 'The user has been successfully registered.', type: User })
    async register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh a user token' })
    @ApiBody({ type: User })
    @ApiResponse({ status: 200, description: 'The user token has been successfully refreshed.', type: User })
    async refreshToken(@Body() body: User) {
        return this.authService.refreshToken(body);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout a user' })
    @ApiBody({ type: User })
    @ApiResponse({ status: 200, description: 'The user has been successfully logged out.', type: User })
    async logout(@Body() body: User) {
        return this.authService.logout(body);
    }


    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot a user password' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'The password reset instructions have been sent to your email.', type: Object })
    async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req) {
        return this.authService.forgotPassword(body, req.ip || req.connection.remoteAddress);
    }

    @Get('reset-password')
    @ApiOperation({ summary: 'Show password reset form' })
    @ApiResponse({ status: 200, description: 'Returns a HTML form for password reset', type: Object })
    async showResetPasswordForm(@Query('token') token: string, @Res() res) {
        try {
            // Validate token first
            await this.authService.validateResetToken(token);
            
            // Return HTML form for password reset
            return res.send(this.mailService.getPasswordResetForm(token));
        } catch (error) {
            return res.send(this.mailService.getInvalidTokenPage());
        }
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset a user password' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'The user password has been successfully reset.', type: Object })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
