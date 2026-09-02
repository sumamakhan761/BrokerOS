// ============================================================================
// BrokerOS — Vapi AI Webhook Deserializer & Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseVapiWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  const messageType = payload.message?.type || payload.type;
  if (messageType !== 'end-of-call-report' && messageType !== 'call-status-update') {
    return [];
  }

  const call = payload.message?.call || payload.call || payload;
  const providerCallId = call.id || 'unknown';
  const recipientPhone = call.customer?.number || '';

  let disposition: any = 'COMPLETED';
  if (call.endedReason === 'customer-did-not-answer') disposition = 'NO_ANSWER';
  else if (call.endedReason === 'customer-busy') disposition = 'BUSY';
  else if (call.endedReason === 'voicemail') disposition = 'VOICEMAIL';
  else if (call.endedReason === 'assistant-error') disposition = 'FAILED';

  const durationSec = Math.round(call.duration || 0);
  const transcript = payload.message?.transcript || call.transcript;
  const summary = payload.message?.summary || call.summary;
  const recordingUrl = payload.message?.recordingUrl || call.recordingUrl;
  const analysis = payload.message?.analysis || call.analysis;

  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
  if (analysis?.sentiment === 'positive') sentiment = 'POSITIVE';
  else if (analysis?.sentiment === 'negative') sentiment = 'NEGATIVE';

  return [
    {
      providerCallId,
      recipientPhone,
      disposition,
      durationSec,
      recordingUrl,
      transcript,
      summary,
      sentiment,
      extractedData: analysis?.structuredData || {},
      timestamp: new Date(),
    },
  ];
}
