// ============================================================================
// BrokerOS — SMS Marketing Types & Interfaces
// ============================================================================

import type { AudienceSourceType, CampaignStatus } from './common.js';

export type SmsProviderType = 'TWILIO' | 'AWS_SNS' | 'SINCH' | 'GUPSHUP';

export interface SmsRecipient {
  phone: string;
  name?: string;
  leadId?: string;
  source?: AudienceSourceType;
  segmentsCount?: number;
  mergeData?: Record<string, string | number | boolean | undefined>;
}

export interface SendSmsOptions {
  from: string; // E.164 phone number, MessagingServiceSid, or Alphanumeric Sender Header
  to: SmsRecipient[];
  message: string;
  campaignId?: string;
  dltTemplateId?: string; // Required for TRAI DLT compliance
  dltEntityId?: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: SmsProviderType;
  providerMessageId?: string;
  sentCount: number;
  segmentsEstimated?: number;
  failedRecipients?: Array<{ phone: string; reason: string }>;
  error?: string;
}

export interface SmsWebhookEvent {
  providerMessageId: string;
  campaignId?: string;
  recipientPhone: string;
  eventType: 'DELIVERED' | 'FAILED' | 'CLICKED';
  timestamp: Date;
  metadata?: {
    reason?: string;
    carrierCode?: string;
    linkUrl?: string;
  };
}

export interface SmsProviderCredentials {
  accountSid?: string;
  authToken?: string;
  messagingServiceSid?: string;
  fromNumber?: string;
  apiKey?: string;
  servicePlanId?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  dltEntityId?: string;
  senderId?: string;
}

export interface ISmsMarketingProvider {
  readonly providerType: SmsProviderType;
  validateCredentials(credentials: SmsProviderCredentials): Promise<boolean>;
  sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[];
}

export interface SmsAudienceEstimationResult {
  totalCount: number;
  validPhoneCount: number;
  duplicateCount: number;
  finalAudienceCount: number;
}

export interface SmsCampaignAnalyticsSummary {
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
