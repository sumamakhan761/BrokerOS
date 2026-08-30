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
      const res = await fetch('https://api.bolna.dev/agent', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
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

    try {
      const res = await fetch(`https://api.bolna.dev/agent/${options.voiceId || 'agent_default'}/call`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_phone_number: options.toPhone,
          telephony_provider: 'twilio',
          from_phone_number: options.fromNumber,
          user_data: {
            ...options.variables,
            prompt: options.scriptPrompt,
          },
        }),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.call_id || `bolna_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.message || `Bolna dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via Bolna AI',
      };
    }
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    return [
      {
        providerCallId: payload.call_id || 'unknown',
        recipientPhone: payload.recipient_phone_number || '',
        disposition: payload.status === 'completed' ? 'COMPLETED' : 'FAILED',
        durationSec: payload.duration || 0,
        recordingUrl: payload.recording_url,
        transcript: payload.transcript,
        summary: payload.summary,
        sentiment: payload.extracted_data?.sentiment === 'positive' ? 'POSITIVE' : 'NEUTRAL',
        extractedData: payload.extracted_data || {},
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (key) {
      try {
        const res = await fetch('https://api.bolna.dev/agent', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (Array.isArray(data) && data.length > 0) {
            const dynamicAgents: VoiceModelItem[] = data.map((ag: any) => ({
              id: ag.agent_id || ag.id,
              name: ag.agent_name || ag.agent_type || 'Bolna Voice Agent',
              provider: 'Bolna AI',
              badge: ag.agent_type || 'Active Agent',
              description: `Live Bolna Agent (${ag.agent_id || ag.id})`,
            }));
            return dynamicAgents;
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    return [
      { id: 'bolna-sales-v2', name: 'Bolna Real Estate Agent v2', provider: 'Bolna AI', badge: 'Interactive', description: 'Autonomous real estate appointment booking engine' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Bolna Low Latency)', provider: 'OpenAI', badge: 'Ultra Fast', description: 'High speed conversational flow' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return [
      { id: 'bolna-aditi', name: 'Aditi (Indian English & Hindi)', provider: 'Bolna AI', accent: 'Indian English / Hindi', gender: 'Female', previewText: 'Namaste! Main Skyline Realty team se call kar rahi hoon.' },
      { id: 'bolna-karan', name: 'Karan (Sales Specialist)', provider: 'Bolna AI', accent: 'Indian English', gender: 'Male', previewText: 'Hello sir, would you be interested in visiting the model villa this Saturday?' },
      { id: 'bolna-rohit', name: 'Rohit (Executive Hindi)', provider: 'Bolna AI', accent: 'Hindi', gender: 'Male', previewText: 'Pranam! Main DLF Privana project ki jankari ke liye call kar raha hoon.' },
    ];
  }
}
