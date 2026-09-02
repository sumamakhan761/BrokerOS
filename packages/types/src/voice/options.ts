// ============================================================================
// BrokerOS — Voice Dispatch Options & Results
// ============================================================================

import type { AudienceSourceType } from '../common.js';
import type { VoiceTelephonyCredentials } from './telephony.js';
import type { VoiceAgentCredentials } from './agent.js';

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
