import type {
  EmailProviderType,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';
import { MailchimpClient } from './client';
import { MailchimpWebhookParser } from './webhooks';

export * from './types';
export * from './client';
export * from './webhooks';

export class MailchimpAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'MAILCHIMP';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new MailchimpClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new MailchimpClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return MailchimpWebhookParser.parse(headers, payload);
  }
}
