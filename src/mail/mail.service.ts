import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MailTemplatesService } from './mail-templates.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailJob } from './mail.processor';
import { Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private mailTemplatesService: MailTemplatesService,
    @InjectQueue('mail-queue') private mailQueue: Queue<EmailJob>
  ) {}

  async sendPasswordResetEmail(user: User, token: string, ipAddress?: string) {
    // Use SERVER_URL from env if available, otherwise use provided IP or fallback to localhost
    const serverUrl = this.configService.get('server.url') || 
                     (ipAddress ? `http://${ipAddress}:3000` : 'http://localhost:3000');
    
    const resetUrl = `${serverUrl}/api/v1/auth/reset-password?token=${token}`;
    const html = this.mailTemplatesService.getPasswordResetEmailTemplate(user.name, resetUrl);

    await this.queueEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendPasswordResetSuccessEmail(user: User) {
    const html = this.mailTemplatesService.getPasswordResetSuccessTemplate(user.name);

    await this.queueEmail({
      to: user.email,
      subject: 'Password Reset Successful',
      html,
    });
  }

  private async queueEmail(emailJob: EmailJob) {
    try {
      const job = await this.mailQueue.add('send-email', emailJob, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      });
      
      this.logger.log(`Email job ${job.id} added to queue`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add email job to queue', error.stack);
      throw error;
    }
  }

  getPasswordResetForm(token: string): string {
    return this.mailTemplatesService.getPasswordResetFormTemplate(token);
  }

  getInvalidTokenPage(): string {
    return this.mailTemplatesService.getInvalidTokenTemplate();
  }
} 