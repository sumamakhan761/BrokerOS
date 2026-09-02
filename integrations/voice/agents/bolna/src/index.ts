// ============================================================================
// BrokerOS — Bolna AI Voice Agent Client
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
import { STANDARD_BOLNA_MODELS, fetchBolnaDynamicAgents } from './bolna-models.js';
import { fetchBolnaDynamicVoices } from './bolna-voices.js';
import { parseBolnaWebhookEvent } from './bolna-webhook-parser.js';
import { dispatchBolnaOutboundCall } from './bolna-dispatcher.js';

export class BolnaAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'BOLNA';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.BOLNA_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;
    try {
      const res = await fetch('https://api.bolna.ai/user/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.status === 200;
    } catch {
      return key.length >= 16;
    }
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
      return { success: false, error: 'Missing Bolna AI API Key' };
    }

    return dispatchBolnaOutboundCall(key, options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseBolnaWebhookEvent(payload);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const dynamic = await fetchBolnaDynamicAgents(credentials?.apiKey || this.apiKey);
    return [...dynamic, ...STANDARD_BOLNA_MODELS];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return fetchBolnaDynamicVoices(credentials?.apiKey || this.apiKey);
  }
}
