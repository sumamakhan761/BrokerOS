import type { ProviderCredentials, SendEmailOptions, SendEmailResult } from '@brokeros/types';

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

      if (res.status === 200) {
        return true;
      }
      if (res.status === 401 || res.status === 403) {
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

