// ============================================================================
// BrokerOS — Sarvam AI Voice Agent Client
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
import { synthesizeSarvamAudio } from './sarvam-tts.js';
import { fetchSarvamModels } from './sarvam-models.js';
import { SARVAM_VOICES } from './sarvam-voices.js';
import { parseSarvamWebhookEvent } from './sarvam-webhook-parser.js';

export class SarvamAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'SARVAM';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.SARVAM_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    return !!key && key.length >= 20;
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    return synthesizeSarvamAudio(credentials?.apiKey || this.apiKey, text, voiceId);
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    return {
      success: true,
      providerCallId: `sarvam_${Date.now()}`,
    };
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseSarvamWebhookEvent(payload);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return fetchSarvamModels(credentials?.apiKey || this.apiKey);
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return SARVAM_VOICES;
  }
}
