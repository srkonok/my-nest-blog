import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

export interface EmailJob {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
}

@Processor('mail-queue')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>) {
    this.logger.log(`Processing email job ${job.id} to: ${job.data.to}`);
    
    try {
      await this.mailerService.sendMail({
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
        from: job.data.from,
        cc: job.data.cc,
        bcc: job.data.bcc,
        attachments: job.data.attachments,
      });
      
      this.logger.log(`Email job ${job.id} completed successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to process email job ${job.id}`, error.stack);
      throw error;
    }
  }
} 