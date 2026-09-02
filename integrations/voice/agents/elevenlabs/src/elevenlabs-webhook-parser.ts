// ============================================================================
// BrokerOS — ElevenLabs Conversational AI Webhook Event Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseElevenLabsWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  return [
    {
      providerCallId: payload.conversation_id || 'unknown',
      recipientPhone: payload.phone_number || '',
      disposition: payload.status === 'completed' ? 'COMPLETED' : 'FAILED',
      durationSec: payload.duration_seconds || 0,
      recordingUrl: payload.recording_url,
      transcript: payload.transcript,
      summary: payload.summary,
      sentiment: payload.sentiment === 'positive' ? 'POSITIVE' : 'NEUTRAL',
      timestamp: new Date(),
    },
  ];
}
