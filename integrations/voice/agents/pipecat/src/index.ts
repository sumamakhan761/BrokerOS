// ============================================================================
// BrokerOS — Pipecat AI Pipeline Voice Agent Client
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
import { PIPECAT_MODELS } from './pipecat-models.js';
import { PIPECAT_VOICES } from './pipecat-voices.js';
import { dispatchPipecatCall } from './pipecat-dispatcher.js';

export class PipecatAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'PIPECAT';
  private apiKey: string;
  private serverUrl: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.PIPECAT_API_KEY || '';
    this.serverUrl = credentials?.serverUrl || process.env.PIPECAT_RUNNER_URL || '';
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
      return { success: false, error: 'Missing Pipecat API Key' };
    }

    return dispatchPipecatCall(key, this.serverUrl, options, credentials);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return [];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return PIPECAT_MODELS;
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return PIPECAT_VOICES;
  }
}
