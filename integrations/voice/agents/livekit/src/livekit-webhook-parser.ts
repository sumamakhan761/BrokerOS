// ============================================================================
// BrokerOS — LiveKit Webhook Event Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseLiveKitWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  return [
    {
      providerCallId: payload.sip_call_id || payload.id || 'unknown',
      recipientPhone: payload.phone_number || '',
      disposition: 'COMPLETED',
      durationSec: payload.duration || 0,
      transcript: payload.transcript,
      sentiment: 'NEUTRAL',
      timestamp: new Date(),
    },
  ];
}
