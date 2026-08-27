import type { EmailWebhookEvent } from '@brokeros/types';
import type { SendgridWebhookEventPayload } from './types';

export class SendgridWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    if (!Array.isArray(payload)) {
      return events;
    }

    for (const item of payload as SendgridWebhookEventPayload[]) {
      const messageId = item.sg_message_id?.split('.')?.[0] || 'unknown';
      const timestamp = item.timestamp ? new Date(item.timestamp * 1000) : new Date();

      switch (item.event) {
        case 'delivered':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'DELIVERED',
            timestamp,
          });
          break;

        case 'open':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'OPENED',
            timestamp,
            metadata: {
              ip: item.ip,
              userAgent: item.useragent,
            },
          });
          break;

        case 'click':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'CLICKED',
            timestamp,
            metadata: {
              linkUrl: item.url,
              ip: item.ip,
              userAgent: item.useragent,
            },
          });
          break;

        case 'bounce':
        case 'dropped':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'BOUNCED',
            timestamp,
            metadata: {
              bounceReason: item.reason || item.response || 'Bounced',
            },
          });
          break;

        case 'spamreport':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'SPAM_COMPLAINT',
            timestamp,
          });
          break;

        case 'unsubscribe':
        case 'group_unsubscribe':
          events.push({
            providerMessageId: messageId,
            campaignId: item.campaign_id,
            recipientEmail: item.email,
            eventType: 'UNSUBSCRIBED',
            timestamp,
          });
          break;
      }
    }

    return events;
  }
}
