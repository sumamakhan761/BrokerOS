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
