import type { EmailWebhookEvent } from '@brokeros/types';
import type { MailchimpWebhookPayload } from './types';

export class MailchimpWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    if (!payload || typeof payload !== 'object') {
      return events;
    }

    const item: MailchimpWebhookPayload = payload;
    const messageId = item.data?.id || 'mc-webhook';
    const recipientEmail = item.data?.email || '';
    const timestamp = item.fired_at ? new Date(item.fired_at) : new Date();

    if (!recipientEmail) return events;

    switch (item.type) {
      case 'unsubscribe':
        events.push({
          providerMessageId: messageId,
          recipientEmail,
          eventType: 'UNSUBSCRIBED',
          timestamp,
          metadata: {
            bounceReason: item.data?.reason,
          },
        });
        break;

      case 'cleaned': // Mailchimp uses 'cleaned' for hard bounces
        events.push({
          providerMessageId: messageId,
          recipientEmail,
          eventType: 'BOUNCED',
          timestamp,
          metadata: {
            bounceReason: item.data?.reason || 'Mailbox cleaned / hard bounce',
          },
        });
        break;
    }

    return events;
  }
}
