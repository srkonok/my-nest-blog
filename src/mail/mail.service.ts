import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MailTemplatesService } from './mail-templates.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private mailTemplatesService: MailTemplatesService
  ) {}

  async sendPasswordResetEmail(user: User, token: string, ipAddress?: string) {
    // Use SERVER_URL from env if available, otherwise use provided IP or fallback to localhost
    const serverUrl = this.configService.get('SERVER_URL') || 
                     (ipAddress ? `http://${ipAddress}:3000` : 'http://localhost:3000');
    
    const resetUrl = `${serverUrl}/api/v1/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: this.mailTemplatesService.getPasswordResetEmailTemplate(user.name, resetUrl),
    });
  }

  getPasswordResetForm(token: string): string {
    return this.mailTemplatesService.getPasswordResetFormTemplate(token);
  }

  getInvalidTokenPage(): string {
    return this.mailTemplatesService.getInvalidTokenTemplate();
  }
} 