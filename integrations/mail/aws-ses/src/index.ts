import crypto from 'crypto';
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

export interface SesCredentials {
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface SesSnsNotification {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
}

export interface SesEventPayload {
  eventType: 'Send' | 'Delivery' | 'Open' | 'Click' | 'Bounce' | 'Complaint' | 'Reject';
  mail: {
    messageId: string;
    source: string;
    destination: string[];
    tags?: Record<string, string[]>;
  };
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: Array<{ emailAddress: string; status: string; diagnosticCode?: string }>;
  };
  complaint?: {
    complainedRecipients: Array<{ emailAddress: string }>;
    complaintFeedbackType?: string;
  };
  open?: {
    ipAddress?: string;
    userAgent?: string;
    timestamp?: string;
  };
  click?: {
    ipAddress?: string;
    userAgent?: string;
    link?: string;
    timestamp?: string;
  };
}

// ============================================================================
// AWS v4 Request Signer
// ============================================================================

function signAwsRequest(
  method: string,
  pathname: string,
  body: string,
  service: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
) {
  const host = `email.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';

  const canonicalRequest = `${method}\n${pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')}`;

  const kDate = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `https://${host}${pathname}`,
    headers: {
      'Content-Type': 'application/json',
      'Host': host,
      'x-amz-date': amzDate,
      'Authorization': authorizationHeader,
    },
  };
}

// ============================================================================
// Client
// ============================================================================

export class SesClient {
  private region: string;
  private accessKeyId: string;
  private secretKey: string;

  constructor(credentials?: ProviderCredentials) {
    this.region =
      credentials?.awsRegion ||
      process.env.AWS_SES_REGION ||
      process.env.AWS_REGION ||
      'ap-south-1';
    this.accessKeyId =
      credentials?.awsAccessKeyId ||
      process.env.AWS_SES_ACCESS_KEY_ID ||
      process.env.AWS_ACCESS_KEY_ID ||
      '';
    this.secretKey =
      credentials?.awsSecretKey ||
      process.env.AWS_SES_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      '';
  }

  async validate(): Promise<boolean> {
    if (!this.accessKeyId || !this.secretKey) return false;

    // Check basic format
    const isValidKeyId = /^[A-Z0-9]{16,32}$/.test(this.accessKeyId);
    const isValidSecret = this.secretKey.length >= 20;
    if (!isValidKeyId || !isValidSecret) return false;

    try {
      // Live ping to AWS SES API (/v2/email/account) to verify IAM credentials
      const signed = signAwsRequest(
        'GET',
        '/v2/email/account',
        '',
        'ses',
        this.region,
        this.accessKeyId,
        this.secretKey,
      );

      const res = await fetch(signed.url, {
        method: 'GET',
        headers: signed.headers,
      });

      // 200 OK: Valid AWS credentials with account query permission
      // 403 Forbidden with InvalidSignatureException: Invalid keys
      if (res.status === 200) {
        return true;
      }

      if (res.status === 403) {
        const errorData = await res.json().catch(() => ({}));
        // If it's an AccessDenied to GetAccount, but signature was valid, keys are functional
        if (errorData?.message?.includes('not authorized to perform: ses:GetAccount')) {
          return true;
        }
        return false;
      }

      return false;
    } catch {
      // Fallback on network timeout
      return isValidKeyId && isValidSecret;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.accessKeyId || !this.secretKey) {
        return {
          success: false,
          provider: 'AWS_SES',
          sentCount: 0,
          error: 'Missing AWS SES Credentials (Access Key or Secret Key)',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'AWS_SES',
          sentCount: 0,
          error: 'No recipients provided for SES dispatch',
        };
      }

      const toAddresses = options.to.map((r) => r.email).filter(Boolean);
      if (toAddresses.length === 0) {
        return {
          success: false,
          provider: 'AWS_SES',
          sentCount: 0,
          error: 'No valid recipient email addresses found',
        };
      }

      const fromAddress = options.fromName
        ? `${options.fromName} <${options.fromEmail}>`
        : options.fromEmail;

      const payload: Record<string, any> = {
        FromEmailAddress: fromAddress,
        Destination: {
          ToAddresses: toAddresses,
        },
        Content: {
          Simple: {
            Subject: {
              Data: options.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: options.htmlContent,
                Charset: 'UTF-8',
              },
              ...(options.plainTextContent
                ? {
                  Text: {
                    Data: options.plainTextContent,
                    Charset: 'UTF-8',
                  },
                }
                : {}),
            },
          },
        },
      };

      if (options.replyTo) {
        payload.ReplyToAddresses = [options.replyTo];
      }

      if (options.tracking?.campaignId) {
        payload.EmailTags = [
          {
            Name: 'campaignId',
            Value: options.tracking.campaignId,
          },
        ];
      }

      const bodyString = JSON.stringify(payload);
      const signed = signAwsRequest(
        'POST',
        '/v2/email/outbound-emails',
        bodyString,
        'ses',
        this.region,
        this.accessKeyId,
        this.secretKey,
      );

      const res = await fetch(signed.url, {
        method: 'POST',
        headers: signed.headers,
        body: bodyString,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        return {
          success: true,
          provider: 'AWS_SES',
          providerMessageId: data?.MessageId || `ses-${Date.now()}`,
          sentCount: toAddresses.length,
        };
      }

      return {
        success: false,
        provider: 'AWS_SES',
        sentCount: 0,
        error: data?.message || `AWS SES dispatch failed with status HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'AWS_SES',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch email via AWS SES',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class SesWebhookParser {
  static parse(headers: Record<string, any>, rawPayload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    try {
      let payload: SesEventPayload;

      if (rawPayload && typeof rawPayload === 'object' && rawPayload.Type === 'Notification' && rawPayload.Message) {
        payload = JSON.parse(rawPayload.Message);
      } else if (rawPayload && typeof rawPayload === 'object') {
        payload = rawPayload;
      } else {
        return events;
      }

      const messageId = payload.mail?.messageId || 'unknown';
      const campaignId = payload.mail?.tags?.campaignId?.[0];

      if (payload.eventType === 'Delivery') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'DELIVERED',
            timestamp: new Date(),
          });
        }
      } else if (payload.eventType === 'Open') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'OPENED',
            timestamp: payload.open?.timestamp ? new Date(payload.open.timestamp) : new Date(),
            metadata: {
              ip: payload.open?.ipAddress,
              userAgent: payload.open?.userAgent,
            },
          });
        }
      } else if (payload.eventType === 'Click') {
        for (const recipient of payload.mail.destination || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient,
            eventType: 'CLICKED',
            timestamp: payload.click?.timestamp ? new Date(payload.click.timestamp) : new Date(),
            metadata: {
              linkUrl: payload.click?.link,
              ip: payload.click?.ipAddress,
              userAgent: payload.click?.userAgent,
            },
          });
        }
      } else if (payload.eventType === 'Bounce') {
        for (const recipient of payload.bounce?.bouncedRecipients || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient.emailAddress,
            eventType: 'BOUNCED',
            timestamp: new Date(),
            metadata: {
              bounceReason: recipient.diagnosticCode || payload.bounce?.bounceType || 'Bounced',
            },
          });
        }
      } else if (payload.eventType === 'Complaint') {
        for (const recipient of payload.complaint?.complainedRecipients || []) {
          events.push({
            providerMessageId: messageId,
            campaignId,
            recipientEmail: recipient.emailAddress,
            eventType: 'SPAM_COMPLAINT',
            timestamp: new Date(),
            metadata: {
              bounceReason: payload.complaint?.complaintFeedbackType || 'Spam Complaint',
            },
          });
        }
      }
    } catch {
      // return empty events on parse failure
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class SesAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'AWS_SES';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new SesClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new SesClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return SesWebhookParser.parse(headers, payload);
  }
}
