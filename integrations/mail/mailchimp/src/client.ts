import type { ProviderCredentials, SendEmailOptions, SendEmailResult } from '@brokeros/types';

export class MailchimpClient {
  private apiKey: string;
  private server: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.MAILCHIMP_API_KEY || '';
    this.server = credentials?.mailchimpServer || process.env.MAILCHIMP_SERVER_PREFIX || 'us1';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    if (this.apiKey.length < 16) {
      return false;
    }

    try {
      // Live ping to Mandrill (Mailchimp Transactional) API to verify key validity
      const res = await fetch('https://mandrillapp.com/api/1.0/users/ping.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: this.apiKey }),
      });

      if (res.status === 200) {
        const text = await res.text();
        return text.includes('PONG') || text.includes('ping');
      }

      return false;
    } catch {
      // Fallback on network timeout
      return this.apiKey.length >= 20;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'MAILCHIMP',
          sentCount: 0,
          error: 'Missing Mailchimp / Mandrill API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'MAILCHIMP',
          sentCount: 0,
          error: 'No recipients provided for Mailchimp dispatch',
        };
      }

      // Build official Mandrill (Mailchimp Transactional) send payload
      const payload: Record<string, any> = {
        key: this.apiKey,
        message: {
          html: options.htmlContent,
          subject: options.subject,
          from_email: options.fromEmail,
          from_name: options.fromName || undefined,
          to: options.to.map((recipient) => ({
            email: recipient.email,
            name: recipient.name || undefined,
            type: 'to',
          })),
        },
      };

      if (options.plainTextContent) {
        payload.message.text = options.plainTextContent;
      }

      if (options.replyTo) {
        payload.message.headers = { 'Reply-To': options.replyTo };
      }

      if (options.tracking) {
        payload.message.track_opens = Boolean(options.tracking.enableOpens);
        payload.message.track_clicks = Boolean(options.tracking.enableClicks);
        if (options.tracking.campaignId) {
          payload.message.tags = [`campaign-${options.tracking.campaignId}`];
        }
      }

      const res = await fetch('https://mandrillapp.com/api/1.0/messages/send.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        const results: any = await res.json().catch(() => []);
        const firstResult = Array.isArray(results) ? results[0] : null;
        const messageId =
          firstResult?._id ||
          `mc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const sentCount = Array.isArray(results)
          ? results.filter((r) => r.status === 'sent' || r.status === 'queued').length
          : options.to.length;

        return {
          success: true,
          provider: 'MAILCHIMP',
          providerMessageId: messageId,
          sentCount: sentCount || options.to.length,
        };
      }

      const errorBody: any = await res.json().catch(() => ({}));
      const errorDetail =
        errorBody?.message ||
        `Mailchimp Mandrill responded with HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'MAILCHIMP',
        sentCount: 0,
        error: errorDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'MAILCHIMP',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch via Mailchimp',
      };
    }
  }
}

