import type {
  ISmsMarketingProvider,
  SendSmsOptions,
  SendSmsResult,
  SmsProviderCredentials,
  SmsProviderType,
  SmsWebhookEvent,
} from '@brokeros/types';

// ============================================================================
// Types
// ============================================================================

export interface TwilioWebhookPayload {
  MessageSid?: string;
  SmsSid?: string;
  AccountSid?: string;
  From?: string;
  To?: string;
  MessageStatus?: 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  SmsStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

// ============================================================================
// Client
// ============================================================================

export class TwilioSmsClient {
  private accountSid: string;
  private authToken: string;
  private messagingServiceSid?: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.accountSid = credentials?.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = credentials?.authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.messagingServiceSid = credentials?.messagingServiceSid || process.env.TWILIO_MESSAGING_SERVICE_SID;
    this.fromNumber = credentials?.fromNumber || process.env.TWILIO_PHONE_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.accountSid || !this.authToken) return false;
    if (!this.accountSid.startsWith('AC') || this.accountSid.length !== 34) return false;

    try {
      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        return data?.status === 'active';
      }
      return false;
    } catch {
      return this.accountSid.startsWith('AC') && this.authToken.length >= 32;
    }
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.accountSid || !this.authToken) {
        return {
          success: false,
          provider: 'TWILIO',
          sentCount: 0,
          error: 'Missing Twilio Account SID or Auth Token',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'TWILIO',
          sentCount: 0,
          error: 'No recipients provided for Twilio SMS dispatch',
        };
      }

      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const failedRecipients: Array<{ phone: string; reason: string }> = [];
      let successCount = 0;
      let lastMsgId: string | undefined;

      const fromSender = options.from || this.messagingServiceSid || this.fromNumber || '';

      for (const rec of options.to) {
        const params = new URLSearchParams();
        params.append('To', rec.phone);
        params.append('Body', options.message);

        if (fromSender.startsWith('MG')) {
          params.append('MessagingServiceSid', fromSender);
        } else {
          params.append('From', fromSender);
        }

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (res.status === 201 || res.status === 200) {
          const body = (await res.json()) as any;
          successCount++;
          lastMsgId = body?.sid;
        } else {
          const errBody = (await res.json().catch(() => ({}))) as any;
          failedRecipients.push({
            phone: rec.phone,
            reason: errBody?.message || `HTTP ${res.status}: ${res.statusText}`,
          });
        }
      }

      return {
        success: successCount > 0,
        provider: 'TWILIO',
        providerMessageId: lastMsgId,
        sentCount: successCount,
        failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
        error: successCount === 0 && failedRecipients.length > 0 ? failedRecipients[0].reason : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'TWILIO',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch SMS via Twilio',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class TwilioSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const item: TwilioWebhookPayload = payload;
    const messageId = item.MessageSid || item.SmsSid || 'unknown';
    const recipientPhone = item.To || '';
    const status = item.MessageStatus || item.SmsStatus;

    if (!recipientPhone) return events;

    if (status === 'delivered') {
      events.push({
        providerMessageId: messageId,
        recipientPhone,
        eventType: 'DELIVERED',
        timestamp: new Date(),
      });
    } else if (status === 'failed' || status === 'undelivered') {
      events.push({
        providerMessageId: messageId,
        recipientPhone,
        eventType: 'FAILED',
        timestamp: new Date(),
        metadata: {
          reason: item.ErrorMessage || item.ErrorCode || 'Undelivered',
        },
      });
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class TwilioSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'TWILIO';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new TwilioSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new TwilioSmsClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return TwilioSmsWebhookParser.parse(headers, payload);
  }
}
