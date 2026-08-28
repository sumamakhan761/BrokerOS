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

export interface GupshupDlrPayload {
  externalId?: string;
  deliveredTS?: string;
  status?: 'SUCCESS' | 'DELIVERED' | 'FAILED' | 'REJECTED' | 'UNDELIVERED';
  cause?: string;
  phoneNo?: string;
  mask?: string;
}

// ============================================================================
// Client
// ============================================================================

export class GupshupSmsClient {
  private apiKey: string;
  private dltEntityId?: string;
  private senderId?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.GUPSHUP_API_KEY || '';
    this.dltEntityId = credentials?.dltEntityId || process.env.GUPSHUP_DLT_ENTITY_ID;
    this.senderId = credentials?.senderId || process.env.GUPSHUP_SENDER_ID || 'SKYLIN';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;
    return this.apiKey.length >= 8;
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'GUPSHUP',
          sentCount: 0,
          error: 'Missing Gupshup API Key or Credentials',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'GUPSHUP',
          sentCount: 0,
          error: 'No recipients provided for Gupshup SMS dispatch',
        };
      }

      const sender = options.from || this.senderId || 'SKYLIN';
      const toPhoneNumbers = options.to.map((r) => r.phone.replace(/[^0-9]/g, '')).join(',');

      const params = new URLSearchParams();
      params.append('method', 'SendMessage');
      params.append('send_to', toPhoneNumbers);
      params.append('msg', options.message);
      params.append('msg_type', 'TEXT');
      params.append('apikey', this.apiKey);
      params.append('mask', sender);
      params.append('v', '1.1');
      params.append('format', 'json');

      if (this.dltEntityId) {
        params.append('principalEntityId', this.dltEntityId);
      }
      if (options.dltTemplateId) {
        params.append('dltTemplateId', options.dltTemplateId);
      }

      const res = await fetch(`https://enterprise.smsgupshup.com/GatewayAPI/rest?${params.toString()}`, {
        method: 'GET',
      });

      const data = (await res.json().catch(() => ({}))) as any;
      const isSuccess = res.status === 200 && (data?.response?.status === 'success' || !data?.response?.status);

      if (isSuccess) {
        const providerMessageId = data?.response?.id || `gs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return {
          success: true,
          provider: 'GUPSHUP',
          providerMessageId,
          sentCount: options.to.length,
        };
      }

      return {
        success: false,
        provider: 'GUPSHUP',
        sentCount: 0,
        error: data?.response?.details || `Gupshup error HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'GUPSHUP',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch SMS via Gupshup',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class GupshupWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const item: GupshupDlrPayload = payload;
    const messageId = item.externalId || 'gupshup-msg';
    const phone = item.phoneNo || '';
    const status = item.status?.toUpperCase();

    if (!phone) return events;

    if (status === 'SUCCESS' || status === 'DELIVERED') {
      events.push({
        providerMessageId: messageId,
        recipientPhone: phone,
        eventType: 'DELIVERED',
        timestamp: item.deliveredTS ? new Date(item.deliveredTS) : new Date(),
      });
    } else if (status === 'FAILED' || status === 'REJECTED' || status === 'UNDELIVERED') {
      events.push({
        providerMessageId: messageId,
        recipientPhone: phone,
        eventType: 'FAILED',
        timestamp: new Date(),
        metadata: {
          reason: item.cause || 'Carrier DND or network failure',
        },
      });
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class GupshupSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'GUPSHUP';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new GupshupSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new GupshupSmsClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return GupshupWebhookParser.parse(headers, payload);
  }
}
