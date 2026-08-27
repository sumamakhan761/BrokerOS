// ============================================================================
// BrokerOS — Email Marketing Types & Interfaces
// ============================================================================

export type EmailProviderType = 'SYSTEM_DEFAULT' | 'AWS_SES' | 'SENDGRID' | 'BREVO' | 'MAILCHIMP';

export type MarketingChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE_CALL';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PAUSED'
  | 'FAILED'
  | 'CANCELLED';

export type RecipientDeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED'
  | 'SPAM_COMPLAINT'
  | 'UNSUBSCRIBED'
  | 'FAILED';

export type AudienceSourceType = 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

export interface EmailRecipient {
  email: string;
  name?: string;
  phone?: string;
  leadId?: string;
  brokerId?: string;
  source?: AudienceSourceType;
  mergeData?: Record<string, string | number | boolean | undefined>;
}

export interface SendEmailOptions {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  tracking?: {
    campaignId: string;
    enableOpens?: boolean;
    enableClicks?: boolean;
  };
  attachments?: Array<{
    filename: string;
    content: string; // Base64 or string
    contentType: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  provider: EmailProviderType;
  providerMessageId?: string;
  sentCount: number;
  failedRecipients?: Array<{ email: string; reason: string }>;
  error?: string;
}

export interface EmailWebhookEvent {
  providerMessageId: string;
  campaignId?: string;
  recipientEmail: string;
  eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'SPAM_COMPLAINT' | 'UNSUBSCRIBED';
  timestamp: Date;
  metadata?: {
    linkUrl?: string;
    bounceReason?: string;
    ip?: string;
    userAgent?: string;
  };
}

export interface ProviderCredentials {
  apiKey?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  mailchimpServer?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

export interface IEmailMarketingProvider {
  readonly providerType: EmailProviderType;
  validateCredentials(credentials: ProviderCredentials): Promise<boolean>;
  sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[];
}

// ── Audience & Filter DTOs ──

export interface AudienceFilterDto {
  temperatures?: Array<'HOT' | 'WARM' | 'COLD'>;
  statuses?: string[];
  projectId?: string;
  minBudget?: number;
  maxBudget?: number;
  city?: string;
  tags?: string[];
  isCpLeadsOnly?: boolean;
}

export interface CsvLeadRow {
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  budget?: number;
  interestedProject?: string;
  temperature?: 'HOT' | 'WARM' | 'COLD';
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface AudienceEstimationResult {
  totalCount: number;
  validEmailCount: number;
  duplicateCount: number;
  unsubscribedCount: number;
  finalAudienceCount: number;
}

// ── Analytics & Dashboard DTOs ──

export interface CampaignAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  providerType: EmailProviderType;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  openedCount: number;
  openRate: number;
  clickedCount: number;
  clickRate: number;
  clickToOpenRate: number;
  bouncedCount: number;
  bounceRate: number;
  unsubscribedCount: number;
  complaintCount: number;
  topClickedLinks: Array<{ url: string; clicks: number }>;
  hourlyActivity: Array<{ hour: string; opens: number; clicks: number }>;
}
