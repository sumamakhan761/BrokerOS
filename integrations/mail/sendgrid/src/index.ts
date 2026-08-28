import type {
  EmailProviderType,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';

// ============================================================================
// Types
// ============================================================================

export interface SendgridWebhookEventPayload {
  email: string;
  timestamp: number;
  event:
    | 'processed'
    | 'dropped'
    | 'delivered'
    | 'deferred'
    | 'bounce'
    | 'open'
    | 'click'
    | 'spamreport'
    | 'unsubscribe'
    | 'group_unsubscribe';
  sg_message_id?: string;
  campaign_id?: string;
  response?: string;
  reason?: string;
  status?: string;
  url?: string;
  ip?: string;
  useragent?: string;
}

// ============================================================================
// Client
// ============================================================================

export class SendgridClient {
  private apiKey: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.SENDGRID_API_KEY || '';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    // Check basic format (SendGrid keys usually start with 'SG.')
    if (!this.apiKey.startsWith('SG.') && this.apiKey.length < 20) {
      return false;
    }

    try {
      // Live ping to SendGrid API to verify active API key status
      const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      // 200 OK: Full access key
      // 403 Forbidden: Valid API key with restricted scope (e.g. Mail Send Only)
      // 401 Unauthorized: Invalid, malformed, or revoked API key
      if (res.status === 200 || res.status === 403) {
        return true;
      }
      if (res.status === 401) {
        return false;
      }

      return this.apiKey.startsWith('SG.');
    } catch {
      // Fallback on network timeout
      return this.apiKey.startsWith('SG.') || this.apiKey.length >= 20;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'SENDGRID',
          sentCount: 0,
          error: 'Missing SendGrid API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'SENDGRID',
          sentCount: 0,
          error: 'No recipients provided for SendGrid dispatch',
        };
      }

      // Build official SendGrid v3 mail send body
      const payload: Record<string, any> = {
        personalizations: options.to.map((recipient) => ({
          to: [{ email: recipient.email, name: recipient.name || undefined }],
          subject: options.subject,
          custom_args: {
            campaign_id: options.tracking?.campaignId || '',
            recipient_email: recipient.email,
          },
        })),
        from: {
          email: options.fromEmail,
          name: options.fromName || undefined,
        },
        content: [
          {
            type: 'text/html',
            value: options.htmlContent,
          },
        ],
      };

      if (options.plainTextContent) {
        payload.content.unshift({
          type: 'text/plain',
          value: options.plainTextContent,
        });
      }

      if (options.replyTo) {
        payload.reply_to = { email: options.replyTo };
      }

      if (options.tracking) {
        payload.tracking_settings = {
          click_tracking: { enable: Boolean(options.tracking.enableClicks) },
          open_tracking: { enable: Boolean(options.tracking.enableOpens) },
        };
      }

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 202 || res.status === 200) {
        const messageId =
          res.headers.get('x-message-id') ||
          `sg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        return {
          success: true,
          provider: 'SENDGRID',
          providerMessageId: messageId,
          sentCount: options.to.length,
        };
      }

      const errorBody: any = await res.json().catch(() => ({}));
      const errorDetail =
        errorBody?.errors?.[0]?.message ||
        `SendGrid responded with HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'SENDGRID',
        sentCount: 0,
        error: errorDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'SENDGRID',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch via SendGrid',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

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

// ============================================================================
// Adapter
// ============================================================================

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
