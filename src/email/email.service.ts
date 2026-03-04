import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplateService } from './email.template.service';
import { SendEmailInput } from './email.types';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly defaultFrom: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {
    const host =
      this.configService.get<string>('email.host') ?? 'smtp.gmail.com';
    const port = this.configService.get<number>('email.port') ?? 587;
    const secure = this.configService.get<boolean>('email.secure') ?? false;
    const user = this.configService.get<string>('email.user') ?? '';
    const password = this.configService.get<string>('email.password') ?? '';
    const from = this.configService.get<string>('email.from') ?? user;
    const fromName =
      this.configService.get<string>('email.fromName') ?? 'Uber Clone ';

    this.defaultFrom = `${fromName} <${from}>`;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });
  }

  public async sendEmail(input: SendEmailInput): Promise<void> {
    const html = this.templateService.render(input.template, input.context);
    await this.transporter.sendMail({
      to: input.to,
      from: input.from ?? this.defaultFrom,
      subject: input.subject,
      html,
    });
  }
}
