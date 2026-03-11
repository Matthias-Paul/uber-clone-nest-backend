import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

export enum EmailEventType {
  ACCOUNT_VERIFICATION = 'account.verification',
  ACCOUNT_VERIFIED = 'account.verified',
}

type AccountVerificationJob = {
  type: EmailEventType.ACCOUNT_VERIFICATION;
  data: {
    email: string;
    name: string;
    code: string;
  };
};

type AccountVerifiedJob = {
  type: EmailEventType.ACCOUNT_VERIFIED;
  data: {
    email: string;
    name: string;
  };
};

export type EmailProcessorJob = AccountVerificationJob | AccountVerifiedJob;

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
      case EmailEventType.ACCOUNT_VERIFIED: {
        const { email, name } = job.data;
        await this.emailService.sendEmail({
          to: email,
          from: this.infoEmailFrom,
          subject: 'Welcome to Uber Clone',
          template: './account.verified',
          context: {
            name,
            year: new Date().getFullYear(),
          },
        });
        return;
      }
    }
  }
}
