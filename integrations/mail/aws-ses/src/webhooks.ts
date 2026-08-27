import type { EmailWebhookEvent } from '@brokeros/types';
import type { SesEventPayload, SesSnsNotification } from './types';

export class SesWebhookParser {
  static parse(headers: Record<string, any>, rawPayload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    try {
      let payload: SesEventPayload;

      // AWS SES events forwarded through SNS arrive with Type = 'Notification' and JSON in Message
      if (rawPayload && typeof rawPayload === 'object' && rawPayload.Type === 'Notification' && rawPayload.Message) {
        payload = JSON.parse(rawPayload.Message);
      } else if (rawPayload && typeof rawPayload === 'object') {
        payload = rawPayload;
      } else {
        return events;
      }

      const messageId = payload.mail?.messageId || 'unknown';
      const campaignId = payload.mail?.tags?.campaignId?.[0];

      if (payload.eventType === 'Delivery') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'DELIVERED',
            timestamp: new Date(),
          });
        }
      } else if (payload.eventType === 'Open') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'OPENED',
            timestamp: payload.open?.timestamp ? new Date(payload.open.timestamp) : new Date(),
            metadata: {
              ip: payload.open?.ipAddress,
              userAgent: payload.open?.userAgent,
            },
          });
        }
      } else if (payload.eventType === 'Click') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'CLICKED',
            timestamp: payload.click?.timestamp ? new Date(payload.click.timestamp) : new Date(),
            metadata: {
              linkUrl: payload.click?.link,
              ip: payload.click?.ipAddress,
              userAgent: payload.click?.userAgent,
            },
          });
        }
      } else if (payload.eventType === 'Bounce') {
        for (const recipient of payload.bounce?.bouncedRecipients || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient.emailAddress,
            eventType: 'BOUNCED',
            timestamp: new Date(),
            metadata: {
              bounceReason: recipient.diagnosticCode || payload.bounce?.bounceType || 'Bounced',
            },
          });
        }
      } else if (payload.eventType === 'Complaint') {
        for (const recipient of payload.complaint?.complainedRecipients || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient.emailAddress,
            eventType: 'SPAM_COMPLAINT',
            timestamp: new Date(),
            metadata: {
              bounceReason: payload.complaint?.complaintFeedbackType || 'Spam Complaint',
            },
          });
        }
      }
    } catch {
      // Return empty events on parse failure
    }

    return events;
  }
}
