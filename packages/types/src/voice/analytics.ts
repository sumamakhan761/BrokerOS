// ============================================================================
// BrokerOS — Voice Analytics & Audience Estimation Types
// ============================================================================

import type { CampaignStatus } from '../common.js';
import type { VoiceTelephonyType } from './telephony.js';
import type { VoiceAgentPlatform } from './agent.js';

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
