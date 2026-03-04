import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/email.config';
import { EmailTemplateService } from './email.template.service';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  providers: [EmailTemplateService, EmailService, EmailProcessor],
  exports: [EmailService, EmailProcessor],
})
export class EmailModule {}
