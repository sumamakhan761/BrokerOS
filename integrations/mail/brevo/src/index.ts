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

export interface BrevoWebhookEventPayload {
  event:
    | 'request'
    | 'delivered'
    | 'hard_bounce'
    | 'soft_bounce'
    | 'blocked'
    | 'spam'
    | 'invalid_email'
    | 'deferred'
    | 'click'
    | 'opened'
    | 'unique_opened'
    | 'unsubscribed'
    | 'list_addition';
  email: string;
  id?: number;
  date: string;
  'message-id'?: string;
  ts?: number;
  'event-id'?: string;
  link?: string;
  ip?: string;
  user_agent?: string;
  reason?: string;
  tag?: string;
  campaign_name?: string;
}

// ============================================================================
// Client
// ============================================================================

export class BrevoClient {
  private apiKey: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.BREVO_API_KEY || '';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    // Brevo API v3 keys start with "xkeysib-"
    if (!this.apiKey.startsWith('xkeysib-') && this.apiKey.length < 20) {
      return false;
    }

    try {
      // Live ping to Brevo API v3 to verify account and API key validity
      const res = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (res.status === 200 || res.status === 403) {
        return true;
      }
      if (res.status === 401) {
        return false;
      }

      return this.apiKey.startsWith('xkeysib-');
    } catch {
      // Fallback on network timeout
      return this.apiKey.startsWith('xkeysib-') || this.apiKey.length >= 20;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'BREVO',
          sentCount: 0,
          error: 'Missing Brevo API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'BREVO',
          sentCount: 0,
          error: 'No recipients provided for Brevo dispatch',
        };
      }

      // Build official Brevo (Sendinblue) Transactional API payload
      const payload: Record<string, any> = {
        sender: {
          name: options.fromName,
          email: options.fromEmail,
        },
        to: options.to.map((recipient) => ({
          email: recipient.email,
          name: recipient.name || undefined,
        })),
        subject: options.subject,
        htmlContent: options.htmlContent,
      };

      if (options.plainTextContent) {
        payload.textContent = options.plainTextContent;
      }

      if (options.replyTo) {
        payload.replyTo = { email: options.replyTo };
      }

      if (options.tracking?.campaignId) {
        payload.tags = [`campaign-${options.tracking.campaignId}`];
      }

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.status === 200) {
        const body: any = await res.json().catch(() => ({}));
        const messageId =
          body?.messageId ||
          body?.messageIds?.[0] ||
          `brevo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        return {
          success: true,
          provider: 'BREVO',
          providerMessageId: messageId,
          sentCount: options.to.length,
        };
      }

      const errorBody: any = await res.json().catch(() => ({}));
      const errorDetail =
        errorBody?.message ||
        `Brevo responded with HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'BREVO',
        sentCount: 0,
        error: errorDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'BREVO',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch via Brevo',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

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

// ============================================================================
// Adapter
// ============================================================================

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
