// ============================================================================
// BrokerOS — Bolna AI Webhook Event Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseBolnaWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  return [
    {
      providerCallId: payload.call_id || payload.execution_id || 'unknown',
      recipientPhone: payload.recipient_phone_number || '',
      disposition: payload.status === 'completed' ? 'COMPLETED' : 'FAILED',
      durationSec: payload.duration || 0,
      recordingUrl: payload.recording_url,
      transcript: payload.transcript,
      summary: payload.summary,
      sentiment: payload.extracted_data?.sentiment === 'positive' ? 'POSITIVE' : 'NEUTRAL',
      extractedData: payload.extracted_data || {},
      timestamp: new Date(),
    },
  ];
}
