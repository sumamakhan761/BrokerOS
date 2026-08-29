export type EmailProviderType = 'SYSTEM_DEFAULT' | 'AWS_SES' | 'SENDGRID' | 'BREVO' | 'MAILCHIMP';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'PAUSED' | 'FAILED' | 'CANCELLED';
export type AudienceSourceType = 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

export interface CampaignItem {
  id: string;
  title: string;
  channel: string;
  status: CampaignStatus;
  providerType: EmailProviderType;
  audienceSource: AudienceSourceType;
  subject: string;
  fromName: string;
  fromEmail: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  scheduledAt?: string;
  createdAt: string;
  project?: { id: string; name: string };
  integration?: { id: string; name: string; provider: string };
  createdBy?: { id: string; name: string; email: string };
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
}

export interface AudienceEstimation {
  totalCount: number;
  validEmailCount: number;
  duplicateCount: number;
  unsubscribedCount: number;
  finalAudienceCount: number;
}

export interface IntegrationRecord {
  id: string;
  provider: EmailProviderType;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export type EmailIntegrationItem = IntegrationRecord;

// ── SMS Types & ViewModels ──

export type SmsProviderType = 'TWILIO' | 'AWS_SNS' | 'SINCH' | 'GUPSHUP';

export interface SmsCampaignItem {
  id: string;
  title: string;
  channel: string;
  status: CampaignStatus;
  providerType: SmsProviderType;
  audienceSource: AudienceSourceType;
  fromSender: string;
  messageContent: string;
  dltTemplateId?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  failedCount: number;
  totalSegmentsSent: number;
  scheduledAt?: string;
  createdAt: string;
  project?: { id: string; name: string };
  integration?: { id: string; name: string; provider: string };
  createdBy?: { id: string; name: string; email: string };
}

export interface SmsIntegrationRecord {
  id: string;
  provider: SmsProviderType;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  fromSender: string;
  awsRegion?: string;
  dltEntityId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SmsRecipientItem {
  id: string;
  phone: string;
  name?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'CLICKED' | 'FAILED';
  source: AudienceSourceType;
  segmentsCount: number;
  clickCount: number;
  firstClickedAt?: string;
  deliveredAt?: string;
  failReason?: string;
  leadId?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    temperature?: string;
    status: string;
  };
  mergeData?: Record<string, unknown>;
}

export interface SmsAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  providerType: SmsProviderType;
  fromSender: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  clickedCount: number;
  clickRate: number;
  failedCount: number;
  totalSegmentsSent: number;
  topClickedLinks: Array<{ url: string; clicks: number }>;
}

export interface SmsAudienceEstimation {
  totalCount: number;
  validPhoneCount: number;
  duplicateCount: number;
  finalAudienceCount: number;
}


