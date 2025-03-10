import { Post, Body, UnauthorizedException, Get, Query, Req, Res } from '@nestjs/common';
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
import { Public } from './decorators/public.decorator';
import { AuditAction, AuditResource } from '../common/interceptors/audit.interceptor';
import { AuditActionType } from '../common/entities/audit-log.entity';
import { VersionedController } from '../common/decorators/api-version.decorator';

@VersionedController(ApiVersion.V1, 'auth')
@AuditResource('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'The user has been successfully logged in.', type: User })
    @AuditAction(AuditActionType.LOGIN)
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

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
    @AuditAction(AuditActionType.CREATE)
    async register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
    @AuditAction(AuditActionType.ACCESS)
    async refreshToken(@Body() body: User) {
        return this.authService.refreshToken(body);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout a user' })
    @ApiResponse({ status: 200, description: 'The user has been successfully logged out.' })
    @AuditAction(AuditActionType.LOGOUT)
    async logout(@Body() body: User) {
        return this.authService.logout(body);
    }

    @Public()
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset email sent.' })
    @AuditAction(AuditActionType.PASSWORD_RESET)
    async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req) {
        return this.authService.forgotPassword(body, req.ip);
    }

    @Public()
    @Get('reset-password')
    @ApiOperation({ summary: 'Show reset password form' })
    @ApiResponse({ status: 200, description: 'Reset password form.' })
    async showResetPasswordForm(@Query('token') token: string, @Res() res) {
        const isValid = await this.authService.validateResetToken(token);
        if (!isValid) {
            return res.status(400).send('Invalid or expired token');
        }
        
        // In a real application, you would render a form here
        // For this example, we'll just return a success message
        return res.status(200).send(`
            <html>
                <body>
                    <h1>Reset Your Password</h1>
                    <form method="POST" action="/api/v1/auth/reset-password">
                        <input type="hidden" name="token" value="${token}" />
                        <div>
                            <label for="password">New Password:</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <div>
                            <label for="confirmPassword">Confirm Password:</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required />
                        </div>
                        <button type="submit">Reset Password</button>
                    </form>
                </body>
            </html>
        `);
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successfully.' })
    @AuditAction(AuditActionType.PASSWORD_CHANGE)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
