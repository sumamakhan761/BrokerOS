import type { EmailWebhookEvent } from '@brokeros/types';
import type { BrevoWebhookEventPayload } from './types';

export class BrevoWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    if (!payload || typeof payload !== 'object') {
      return events;
    }

    const item: BrevoWebhookEventPayload = payload;
    const messageId = item['message-id'] || String(item.id || 'unknown');
    const timestamp = item.date ? new Date(item.date) : new Date();

    switch (item.event) {
      case 'delivered':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'DELIVERED',
          timestamp,
        });
        break;

      case 'opened':
      case 'unique_opened':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'OPENED',
          timestamp,
          metadata: {
            ip: item.ip,
            userAgent: item.user_agent,
          },
        });
        break;

      case 'click':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'CLICKED',
          timestamp,
          metadata: {
            linkUrl: item.link,
            ip: item.ip,
            userAgent: item.user_agent,
          },
        });
        break;

      case 'hard_bounce':
      case 'soft_bounce':
      case 'blocked':
      case 'invalid_email':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'BOUNCED',
          timestamp,
          metadata: {
            bounceReason: item.reason || 'Bounced',
          },
        });
        break;

      case 'spam':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'SPAM_COMPLAINT',
          timestamp,
        });
        break;

      case 'unsubscribed':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'UNSUBSCRIBED',
          timestamp,
        });
        break;
    }

    return events;
  }
}
