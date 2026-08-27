import type {
  EmailProviderType,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';
import { BrevoClient } from './client';
import { BrevoWebhookParser } from './webhooks';

export * from './types';
export * from './client';
export * from './webhooks';

export class BrevoAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'BREVO';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new BrevoClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new BrevoClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return BrevoWebhookParser.parse(headers, payload);
  }
}
