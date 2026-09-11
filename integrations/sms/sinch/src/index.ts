import type {
  DiscoveredSenderNumber,
  InboundSmsPayload,
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

export interface SinchDeliveryReport {
  type: 'recipient_delivery_report_sms';
  batch_id: string;
  recipient: string;
  status: 'Delivered' | 'Failed' | 'Queued' | 'Sent' | 'Unknown';
  code: number;
  at: string;
  operator_status_at?: string;
}

// ============================================================================
// Client
// ============================================================================

export class SinchSmsClient {
  private servicePlanId: string;
  private apiKey: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.servicePlanId = credentials?.servicePlanId || process.env.SINCH_SERVICE_PLAN_ID || '';
    this.apiKey = credentials?.apiKey || process.env.SINCH_API_TOKEN || '';
    this.fromNumber = credentials?.fromNumber || process.env.SINCH_VIRTUAL_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.servicePlanId || !this.apiKey) return false;
    if (this.servicePlanId.length < 10 || this.apiKey.length < 15) return false;

    try {
      const res = await fetch(`https://sms.api.sinch.com/xms/v1/${this.servicePlanId}/inbounds`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (res.status === 200 || res.status === 403) {
        return true;
      }
      return false;
    } catch {
      return this.servicePlanId.length >= 10 && this.apiKey.length >= 15;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Sinch Verified',
        provider: 'SINCH',
        isVerified: true,
      });
    }

    if (!this.servicePlanId || !this.apiKey) return discovered;

    try {
      const res = await fetch(
        `https://numbers.api.sinch.com/v1/projects/${this.servicePlanId}/activePhoneNumbers`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      if (res.status === 200) {
        const data = (await res.json()) as any;
        const numbers = data?.activeNumbers || [];
        for (const num of numbers) {
          const phone = num?.phoneNumber;
          if (phone && !discovered.some((d) => d.phoneNumber === phone)) {
            discovered.push({
              phoneNumber: phone,
              senderId: num?.displayName || 'Sinch Virtual',
              provider: 'SINCH',
              isVerified: true,
            });
          }
        }
      }
    } catch {
      // Return fallback
    }

    return discovered;
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.servicePlanId || !this.apiKey) {
        return {
          success: false,
          provider: 'SINCH',
          sentCount: 0,
          error: 'Missing Sinch Service Plan ID or API Token',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'SINCH',
          sentCount: 0,
          error: 'No recipients provided for Sinch SMS dispatch',
        };
      }

      const fromSender = options.from || this.fromNumber || 'BrokerOS';
      const toPhones = options.to.map((r) => r.phone);

      const payload = {
        from: fromSender,
        to: toPhones,
        body: options.message,
      };

      const res = await fetch(`https://sms.api.sinch.com/xms/v1/${this.servicePlanId}/batches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.status === 200) {
        const data = (await res.json()) as any;
        return {
          success: true,
          provider: 'SINCH',
          providerMessageId: data?.id || `sinch-${Date.now()}`,
          sentCount: options.to.length,
        };
      }

      const errorBody = (await res.json().catch(() => ({}))) as any;
      return {
        success: false,
        provider: 'SINCH',
        sentCount: 0,
        error: errorBody?.text || `Sinch responded with HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'SINCH',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch SMS via Sinch',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class SinchSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const item: SinchDeliveryReport = payload;
    const batchId = item.batch_id || 'sinch-unknown';
    const phone = item.recipient || '';
    const status = item.status;

    if (!phone) return events;

    if (status === 'Delivered') {
      events.push({
        providerMessageId: batchId,
        recipientPhone: phone,
        eventType: 'DELIVERED',
        timestamp: item.at ? new Date(item.at) : new Date(),
      });
    } else if (status === 'Failed') {
      events.push({
        providerMessageId: batchId,
        recipientPhone: phone,
        eventType: 'FAILED',
        timestamp: item.at ? new Date(item.at) : new Date(),
        metadata: {
          reason: `Carrier error code: ${item.code}`,
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const fromPhone = payload.from || payload.From;
    const toPhone = payload.to || payload.To || '';
    const textBody = payload.body || payload.Body || payload.text;
    const providerMsgId = payload.id || payload.batch_id || payload.messageId;

    if (!fromPhone || !textBody) return null;

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'SINCH',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class SinchSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'SINCH';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new SinchSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new SinchSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new SinchSmsClient(credentials);
    return client.listSenderNumbers();
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return SinchSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return SinchSmsWebhookParser.parseInbound(headers, payload);
  }
}
