// ============================================================================
// BrokerOS — Voice Webhook Event Types
// ============================================================================

import type { VoiceCallDisposition } from './options.js';

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
