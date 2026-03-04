export interface SendEmailInput {
  to: string;
  from?: string;
  subject: string;
  template: string;
  context?: Record<string, string | number>;
}
