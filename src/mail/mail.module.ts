import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from '.';
import { MailTemplatesService } from './mail-templates.service';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail.host'),
          port: configService.get('mail.port'),
          secure: false,
          auth: {
            user: configService.get('mail.user'),
            pass: configService.get('mail.password'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get('mail.from')}>`,
        },
      }),
    }),
  ],
  providers: [MailService, MailTemplatesService, MailProcessor],
  exports: [MailService],
})
export class MailModule {} 