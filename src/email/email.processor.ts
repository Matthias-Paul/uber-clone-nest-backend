import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

export enum EmailEventType {
  ACCOUNT_VERIFICATION = 'account.verification',
}

type AccountVerificationJob = {
  type: EmailEventType.ACCOUNT_VERIFICATION;
  data: {
    email: string;
    name: string;
    code: string;
  };
};

export type EmailProcessorJob = AccountVerificationJob;

@Injectable()
export class EmailProcessor {
  private readonly infoEmailFrom: string;
  private readonly formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    const from = this.configService.get<string>('email.from') ?? '';
    const fromName =
      this.configService.get<string>('email.fromName') ?? 'Uber clone';
    this.infoEmailFrom = `${fromName} <${from}>`;
  }

  public async process(job: EmailProcessorJob): Promise<void> {
    switch (job.type) {
      case EmailEventType.ACCOUNT_VERIFICATION: {
        const { email, name, code } = job.data;
        await this.emailService.sendEmail({
          to: email,
          from: this.infoEmailFrom,
          subject: 'Verify your account',
          template: './account.verification',
          context: {
            name,
            code,
            year: new Date().getFullYear(),
          },
        });
        return;
      }
    }
  }
}
