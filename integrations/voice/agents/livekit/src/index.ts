// ============================================================================
// BrokerOS — LiveKit Voice Agent Client
// ============================================================================

import type {
  IVoiceAgentProvider,
  SendVoiceOptions,
  SendVoiceResult,
  VoiceAgentCredentials,
  VoiceAgentPlatform,
  VoiceWebhookEvent,
  VoiceModelItem,
  VoicePersonaItem,
} from '@brokeros/types';
import { LIVEKIT_MODELS } from './livekit-models.js';
import { LIVEKIT_VOICES } from './livekit-voices.js';
import { parseLiveKitWebhookEvent } from './livekit-webhook-parser.js';
import { dispatchLiveKitCall } from './livekit-dispatcher.js';

export class LiveKitAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'LIVEKIT';
  private apiKey: string;
  private serverUrl: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.LIVEKIT_API_KEY || '';
    this.serverUrl = credentials?.serverUrl || process.env.LIVEKIT_URL || 'https://livekit.cloud';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    return !!key && key.length >= 8;
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    return {
      audioBuffer: Buffer.from(text, 'utf-8'),
      contentType: 'audio/mpeg',
    };
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing LiveKit API Key' };
    }

    return dispatchLiveKitCall(key, this.serverUrl, options, credentials);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseLiveKitWebhookEvent(payload);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return LIVEKIT_MODELS;
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return LIVEKIT_VOICES;
  }
}
