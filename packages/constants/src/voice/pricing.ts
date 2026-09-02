// ============================================================================
// BrokerOS — Voice Telephony & AI Agent Pricing Estimates
// ============================================================================

export const VOICE_TELEPHONY_PRICING_ESTIMATES = {
  TWILIO: { costPerMinuteUSD: 0.014, costPerMinuteINR: 1.15, label: 'Twilio Voice (~₹1.15/min)' },
  VOBIZ: { costPerMinuteUSD: 0.008, costPerMinuteINR: 0.65, label: 'Vobiz Telecom (~₹0.65/min)' },
  EXOTEL: { costPerMinuteUSD: 0.007, costPerMinuteINR: 0.58, label: 'Exotel DLT (~₹0.58/min)' },
  TELNYX: { costPerMinuteUSD: 0.009, costPerMinuteINR: 0.75, label: 'Telnyx Backbone (~₹0.75/min)' },
} as const;

export const VOICE_AGENT_PRICING_ESTIMATES = {
  VAPI: { costPerMinuteUSD: 0.05, label: 'Vapi Orchestrator (~$0.05/min)' },
  RETELL: { costPerMinuteUSD: 0.07, label: 'Retell AI (~$0.07/min)' },
  SARVAM: { costPerMinuteUSD: 0.02, label: 'Sarvam Indic (~$0.02/min)' },
  BOLNA: { costPerMinuteUSD: 0.03, label: 'Bolna Real Estate (~$0.03/min)' },
  ELEVENLABS: { costPerMinuteUSD: 0.08, label: 'ElevenLabs ConvAI (~$0.08/min)' },
  OPENAI_REALTIME: { costPerMinuteUSD: 0.06, label: 'OpenAI Realtime (~$0.06/min)' },
  LIVEKIT: { costPerMinuteUSD: 0.015, label: 'LiveKit WebRTC (~$0.015/min)' },
  PIPECAT: { costPerMinuteUSD: 0.01, label: 'Pipecat Custom (~$0.01/min)' },
} as const;
