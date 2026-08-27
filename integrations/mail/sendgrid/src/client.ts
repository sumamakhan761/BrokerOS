import type { ProviderCredentials, SendEmailOptions, SendEmailResult } from '@brokeros/types';

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

      if (res.status === 200) {
        return true;
      }
      if (res.status === 401 || res.status === 403) {
        return false;
      }

      // If other response (rate limit or scopes), consider valid if format is SG.
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

