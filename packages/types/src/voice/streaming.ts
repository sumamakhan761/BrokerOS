// ============================================================================
// BrokerOS — Voice Media Streaming & WebSocket Session Types
// ============================================================================

export const TELEPHONY_STREAM_EVENT = 'media';

export interface TelephonyStreamSession {
  streamSid: string;
  callSid: string;
  campaignId?: string;
  agentPlatform?: string;
  voiceId: string;
  voiceProvider: string;
  firstMessage: string;
  scriptPrompt: string;
  socketId: string;
  startedAt: Date;
  audioPacketsReceived: number;
  audioPacketsSent: number;
}

export interface TelephonyStreamCustomParameters {
  campaignId?: string;
  recipientId?: string;
  firstMessage?: string;
  scriptPrompt?: string;
  agentPlatform?: string;
  voiceId?: string;
  voiceProvider?: string;
}

export interface AudioStreamChunk {
  event: 'media';
  streamSid: string;
  media: {
    payload: string; // Base64 8kHz mu-law audio
  };
}
