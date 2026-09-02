// ============================================================================
// BrokerOS — Shared Common Marketing & Audience Types
// ============================================================================

export type MarketingChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE_CALL';
export const MARKETING_CHANNELS: MarketingChannel[] = ['EMAIL', 'SMS', 'WHATSAPP', 'VOICE_CALL'];

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
