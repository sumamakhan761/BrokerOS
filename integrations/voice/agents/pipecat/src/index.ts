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

export class PipecatAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'PIPECAT';

  private serverUrl: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.serverUrl = credentials?.serverUrl || process.env.PIPECAT_RUNNER_URL || 'http://localhost:8765';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const url = credentials?.serverUrl || this.serverUrl;
    try {
      const res = await fetch(`${url}/health`, { method: 'GET' });
      return res.status === 200;
    } catch {
      return !!url;
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
    const url = credentials?.serverUrl || this.serverUrl;

    try {
      const res = await fetch(`${url}/start-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dialout_settings: {
            to: options.toPhone,
            from: options.fromNumber,
          },
          llm_model: options.llmModel,
          system_prompt: options.scriptPrompt,
          voice_id: options.voiceId,
        }),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.bot_id || `pipe_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.message || `Pipecat dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via Pipecat',
      };
    }
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    return [
      {
        providerCallId: payload.bot_id || 'unknown',
        recipientPhone: payload.phone || '',
        disposition: 'COMPLETED',
        durationSec: payload.duration || 0,
        recordingUrl: payload.recording_url,
        transcript: payload.transcript,
        sentiment: 'NEUTRAL',
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const url = credentials?.serverUrl || this.serverUrl;
    if (url) {
      try {
        const res = await fetch(`${url}/health`);
        if (res.ok) {
          return [
            { id: 'pipecat-daily-realtime', name: 'Pipecat Daily WebRTC Runner (Online)', provider: 'Pipecat', badge: 'Live Pipeline', description: `Connected to runner at ${url}` },
            { id: 'gpt-4o-mini-pipecat', name: 'GPT-4o Mini (Pipecat LLM)', provider: 'OpenAI', badge: 'Fast Stream', description: 'Streaming conversational responses via runner' },
          ];
        }
      } catch {
        // Fallback
      }
    }
    return [
      { id: 'pipecat-daily-realtime', name: 'Pipecat Daily WebRTC Pipeline', provider: 'Pipecat', badge: 'Ultra Low Latency', description: 'Real-time conversational audio pipeline framework' },
      { id: 'gpt-4o-mini-pipecat', name: 'GPT-4o Mini (Pipecat LLM)', provider: 'OpenAI', badge: 'Fast Stream', description: 'Streaming conversational responses' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return [
      { id: 'cartesia-british-female', name: 'Victoria (British Real Estate)', provider: 'Pipecat', accent: 'British Professional', gender: 'Female', previewText: 'Good afternoon, calling regarding the penthouse preview.' },
      { id: 'cartesia-american-male', name: 'Lucas (Corporate Advisor)', provider: 'Pipecat', accent: 'American Professional', gender: 'Male', previewText: 'Hello sir, let me walk you through the investment yields.' },
    ];
  }
}
