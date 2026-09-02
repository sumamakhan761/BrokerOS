// ============================================================================
// BrokerOS — Retell AI Webhook Event Parser
// ============================================================================

import type { VoiceWebhookEvent } from '@brokeros/types';

export function parseRetellWebhookEvent(payload: any): VoiceWebhookEvent[] {
  if (!payload) return [];

  const eventType = payload.event;
  if (eventType !== 'call_analyzed' && eventType !== 'call_ended') {
    return [];
  }

  const call = payload.call || payload;
  const providerCallId = call.call_id || 'unknown';
  const recipientPhone = call.to_number || call.customer_number || '';

  let disposition: any = 'COMPLETED';
  if (call.disconnection_reason === 'user_did_not_answer') disposition = 'NO_ANSWER';
  else if (call.disconnection_reason === 'user_busy') disposition = 'BUSY';
  else if (call.disconnection_reason === 'voicemail_reached') disposition = 'VOICEMAIL';
  else if (call.disconnection_reason === 'agent_error') disposition = 'FAILED';

  const durationSec = Math.round((call.end_timestamp - call.start_timestamp) / 1000) || 0;
  const transcript = call.transcript;
  const summary = call.call_analysis?.call_summary;
  const recordingUrl = call.recording_url;

  let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
  if (call.call_analysis?.user_sentiment === 'Positive') sentiment = 'POSITIVE';
  else if (call.call_analysis?.user_sentiment === 'Negative') sentiment = 'NEGATIVE';

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
      extractedData: call.call_analysis?.custom_analysis_data || {},
      timestamp: new Date(),
    },
  ];
}
