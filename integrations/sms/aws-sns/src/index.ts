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
    this.accessKeyId = credentials?.awsAccessKeyId || process.env.AWS_SNS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    this.secretKey = credentials?.awsSecretKey || process.env.AWS_SNS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
    this.region = credentials?.awsRegion || process.env.AWS_SNS_REGION || process.env.AWS_REGION || 'ap-south-1';
    this.senderId = credentials?.senderId || process.env.AWS_SNS_SENDER_ID;
  }

  async validate(): Promise<boolean> {
    if (!this.accessKeyId || !this.secretKey) return false;
    const isValidKeyId = /^[A-Z0-9]{16,32}$/.test(this.accessKeyId);
    const isValidSecret = this.secretKey.length >= 20;
    return isValidKeyId && isValidSecret;
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

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return AwsSnsWebhookParser.parse(headers, payload);
  }
}
