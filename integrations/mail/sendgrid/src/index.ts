import type {
  EmailProviderType,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';
import { SendgridClient } from './client';
import { SendgridWebhookParser } from './webhooks';

export * from './types';
export * from './client';
export * from './webhooks';

export class SendgridAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'SENDGRID';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new SendgridClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new SendgridClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return SendgridWebhookParser.parse(headers, payload);
  }
}
