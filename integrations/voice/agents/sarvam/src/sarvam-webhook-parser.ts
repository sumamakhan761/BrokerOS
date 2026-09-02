// ============================================================================
// BrokerOS — Sarvam AI Webhook Deserializer & Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseSarvamWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  return [
    {
      providerCallId: payload.call_id || payload.id || 'unknown',
      recipientPhone: payload.phone || '',
      disposition: 'COMPLETED',
      durationSec: payload.duration || 0,
      transcript: payload.transcript,
      sentiment: 'POSITIVE',
      timestamp: new Date(),
    },
  ];
}
