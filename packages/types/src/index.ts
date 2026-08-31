// ============================================================================
// BrokerOS — Shared Types & Interfaces
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

// ============================================================================
// SMS Marketing Types & Interfaces
// ============================================================================

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

// ============================================================================
// Voice & AI Agent Marketing Types & Interfaces
// ============================================================================

export type VoiceTelephonyType = 'TWILIO' | 'VOBIZ' | 'EXOTEL' | 'TELNYX' | 'AMAZON_CONNECT';

export type VoiceAgentPlatform =
  | 'VAPI'
  | 'RETELL'
  | 'ELEVENLABS'
  | 'SARVAM'
  | 'BOLNA'
  | 'PIPECAT'
  | 'LIVEKIT'
  | 'OPENAI_REALTIME';

export type VoiceCallDisposition =
  | 'COMPLETED'
  | 'BUSY'
  | 'NO_ANSWER'
  | 'VOICEMAIL'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'RINGING';

export interface VoiceRecipient {
  phone: string;
  name?: string;
  leadId?: string;
  source?: AudienceSourceType;
  mergeData?: Record<string, string | number | boolean | undefined>;
}

export interface VoiceTelephonyCredentials {
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  apiToken?: string;
  subdomain?: string;
  sipDomain?: string;
  fromNumbers?: string[];
}

export interface VoiceAgentCredentials {
  apiKey?: string;
  apiSecret?: string;
  orgId?: string;
  serverUrl?: string;
}

export interface SendVoiceOptions {
  toPhone: string;
  fromNumber: string;
  campaignId: string;
  recipientId?: string;
  llmModel: string;
  voiceProvider: string;
  voiceId: string;
  voiceName?: string;
  scriptPrompt: string;
  firstMessage?: string;
  telephonyCredentials?: VoiceTelephonyCredentials;
  agentCredentials?: VoiceAgentCredentials;
  variables?: Record<string, string | number | boolean | undefined>;
  transcriberModel?: string;
  transcriberLanguage?: string;
  maxTurnSilenceMs?: number;
  voiceSpeed?: number;
  firstMessageMode?: string;
  voicemailDetection?: string;
  backgroundSound?: string;
  maxDurationSeconds?: number;
  // Retell Specific Dynamic Parameters
  voiceModel?: string;
  voiceEmotion?: string;
  enableExpressiveMode?: boolean;
  expressiveEmotionTags?: string[];
  enableBackchannel?: boolean;
  backchannelFrequency?: number;
  ambientSound?: string;
  ambientSoundVolume?: number;
  reminderTriggerMs?: number;
  reminderMaxCount?: number;
  language?: string | string[];
  responsiveness?: number;
  interruptionSensitivity?: number;
  enableDynamicVoiceSpeed?: boolean;
  beginMessageDelayMs?: number;
}

export interface SendVoiceResult {
  success: boolean;
  providerCallId?: string;
  error?: string;
}

export interface VoiceWebhookEvent {
  providerCallId: string;
  campaignId?: string;
  recipientPhone: string;
  disposition: VoiceCallDisposition;
  durationSec?: number;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  extractedData?: Record<string, any>;
  timestamp: Date;
}

export interface IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType;
  validateCredentials(credentials: VoiceTelephonyCredentials): Promise<boolean>;
  testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }>;
}

export interface VoiceModelItem {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  description?: string;
}

export interface VoicePersonaItem {
  id: string;
  name: string;
  provider: string;
  accent: string;
  gender: string;
  tags?: string[];
  previewUrl?: string;
  previewText?: string;
}

export interface IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform;
  validateCredentials(credentials: VoiceAgentCredentials): Promise<boolean>;
  previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }>;
  dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[];
  getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]>;
  getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]>;
  getAccountAssistants?(credentials?: VoiceAgentCredentials): Promise<any[]>;
}

export interface VoiceAudienceEstimationResult {
  totalCount: number;
  validPhoneCount: number;
  duplicateCount: number;
  dndCount: number;
  finalAudienceCount: number;
}

export interface VoiceCampaignAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  telephonyType: VoiceTelephonyType;
  agentPlatform: VoiceAgentPlatform;
  callerIdNumber?: string;
  totalRecipients: number;
  completedCalls: number;
  busyCalls: number;
  noAnswerCalls: number;
  failedCalls: number;
  completionRate: number;
  averageDurationSec: number;
  totalDurationSec: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentCallLogs: Array<{
    recipientId: string;
    phone: string;
    name?: string;
    durationSec: number;
    disposition: string;
    sentiment?: string;
    summary?: string;
    recordingUrl?: string;
  }>;
}


