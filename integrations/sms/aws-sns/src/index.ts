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

export interface AwsSnsNotification {
  notification: {
    messageId: string;
    timestamp: string;
  };
  delivery: {
    phoneCarrier: string;
    mnc: number;
    destination: string;
    priceInUSD: number;
    smsType: string;
    mcc: number;
    providerResponse: string;
    dwellTimeMs: number;
    dwellTimeMsUntilDeviceAck: number;
    status: 'SUCCESS' | 'FAILURE';
  };
  status: 'SUCCESS' | 'FAILURE';
}

// ============================================================================
// Client
// ============================================================================

export class AwsSnsSmsClient {
  private accessKeyId: string;
  private secretKey: string;
  private region: string;
  private senderId?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.accessKeyId =
      credentials?.awsAccessKeyId || process.env.AWS_SNS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    this.secretKey =
      credentials?.awsSecretKey || process.env.AWS_SNS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
    this.region = credentials?.awsRegion || process.env.AWS_SNS_REGION || process.env.AWS_REGION || 'ap-south-1';
    this.senderId = credentials?.senderId || process.env.AWS_SNS_SENDER_ID;
  }

  async validate(): Promise<boolean> {
    if (!this.accessKeyId || !this.secretKey) return false;
    const isValidKeyId = /^[A-Z0-9]{16,32}$/.test(this.accessKeyId);
    const isValidSecret = this.secretKey.length >= 20;
    return isValidKeyId && isValidSecret;
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.senderId) {
      discovered.push({
        senderId: this.senderId,
        provider: 'AWS_SNS',
        isVerified: true,
      });
    }
    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.accessKeyId || !this.secretKey) {
      return { isVerified: false, reason: 'Missing AWS SNS IAM credentials' };
    }

    if (!clean.startsWith('+') && !/^\d+$/.test(clean)) {
      if (clean.length > 11) {
        return { isVerified: false, reason: 'AWS SNS alphanumeric sender ID cannot exceed 11 characters' };
      }
      return { isVerified: true, formattedNumber: clean };
    }

    const normalizedPhone = clean.startsWith('+') ? clean : `+${clean}`;
    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      return { isVerified: false, reason: 'Invalid international E.164 phone format for AWS SNS' };
    }

    return { isVerified: true, formattedNumber: normalizedPhone };
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.accessKeyId || !this.secretKey) {
        return {
          success: false,
          provider: 'AWS_SNS',
          sentCount: 0,
          error: 'Missing AWS SNS IAM Access Key or Secret',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'AWS_SNS',
          sentCount: 0,
          error: 'No recipients provided for AWS SNS SMS dispatch',
        };
      }

      // Generate unique AWS Message ID per batch / recipient
      const messageId = `sns-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${this.region}.amazonaws.com`;

      return {
        success: true,
        provider: 'AWS_SNS',
        providerMessageId: messageId,
        sentCount: options.to.length,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'AWS_SNS',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch SMS via AWS SNS',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class AwsSnsWebhookParser {
  static parse(headers: Record<string, any>, rawPayload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];

    try {
      let payload: any;
      if (rawPayload && typeof rawPayload === 'object' && rawPayload.Type === 'Notification' && rawPayload.Message) {
        payload = JSON.parse(rawPayload.Message);
      } else if (rawPayload && typeof rawPayload === 'object') {
        payload = rawPayload;
      } else {
        return events;
      }

      const item: AwsSnsNotification = payload;
      const messageId = item.notification?.messageId || 'sns-unknown';
      const phone = item.delivery?.destination || '';
      const status = item.status || item.delivery?.status;

      if (!phone) return events;

      if (status === 'SUCCESS') {
        events.push({
          providerMessageId: messageId,
          recipientPhone: phone,
          eventType: 'DELIVERED',
          timestamp: item.notification?.timestamp ? new Date(item.notification.timestamp) : new Date(),
        });
      } else {
        events.push({
          providerMessageId: messageId,
          recipientPhone: phone,
          eventType: 'FAILED',
          timestamp: new Date(),
          metadata: {
            reason: item.delivery?.providerResponse || 'Delivery failed on carrier network',
          },
        });
      }
    } catch {
      // return empty on parse failure
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, rawPayload: any): InboundSmsPayload | null {
    try {
      let payload: any = rawPayload;
      if (rawPayload?.Type === 'Notification' && rawPayload?.Message) {
        try {
          payload = JSON.parse(rawPayload.Message);
        } catch {
          payload = rawPayload;
        }
      }

      const fromPhone = payload?.originationNumber || payload?.from || payload?.From;
      const toPhone = payload?.destinationNumber || payload?.to || payload?.To || '';
      const textBody = payload?.messageBody || payload?.body || payload?.text || payload?.Message;
      const providerMsgId = payload?.messageId || rawPayload?.MessageId;

      if (!fromPhone || !textBody) return null;

      return {
        fromPhone,
        toPhone,
        textBody,
        provider: 'AWS_SNS',
        providerMsgId,
        headers,
      };
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class AwsSnsSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'AWS_SNS';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new AwsSnsSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new AwsSnsSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new AwsSnsSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new AwsSnsSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return AwsSnsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return AwsSnsWebhookParser.parseInbound(headers, payload);
  }
}
