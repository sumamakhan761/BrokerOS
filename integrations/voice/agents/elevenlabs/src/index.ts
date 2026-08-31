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

export class ElevenLabsAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'ELEVENLABS';

  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;

    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'xi-api-key': key,
        },
      });

      return res.status === 200;
    } catch {
      return key.length >= 24;
    }
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      // Mock audio buffer for preview when no key is set
      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/mpeg',
      };
    }

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || '21m00Tcm4TlvDq8ikWAM'}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (res.status === 200) {
        const arrayBuf = await res.arrayBuffer();
        return {
          audioBuffer: Buffer.from(arrayBuf),
          contentType: 'audio/mpeg',
        };
      }

      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/mpeg',
      };
    } catch {
      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/mpeg',
      };
    }
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing ElevenLabs API Key' };
    }

    try {
      const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
        method: 'POST',
        headers: {
          'xi-api-key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: options.voiceId || 'default',
          dynamic_variables: options.variables || {},
        }),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.conversation_id || `11labs_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.detail?.message || `ElevenLabs dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via ElevenLabs',
      };
    }
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (key) {
      try {
        const res = await fetch('https://api.elevenlabs.io/v1/models', {
          headers: { 'xi-api-key': key },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (Array.isArray(data)) {
            return data.map((m: any) => ({
              id: m.model_id,
              name: m.name || m.model_id,
              provider: 'ElevenLabs',
              badge: m.can_do_voice_conversion ? 'High Fidelity' : 'Standard',
              description: m.description || 'ElevenLabs Neural Speech Model',
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    return [
      { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', provider: 'ElevenLabs', badge: 'Ultra Realistic', description: 'Cross-language natural voice synthesis' },
      { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', provider: 'ElevenLabs', badge: 'Ultra Low Latency', description: 'Fastest conversational voice model (~75ms)' },
      { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', provider: 'ElevenLabs', badge: 'High Speed', description: 'Real-time conversational streaming' },
    ];
  }

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return [];

    try {
      const res = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
        method: 'GET',
        headers: {
          'xi-api-key': key,
        },
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const agentsList = Array.isArray(data) ? data : data.agents || [];
        return agentsList.map((a: any) => ({
          id: a.agent_id,
          name: a.name || a.agent_id,
          voice: {
            voiceId: a.conversation_config?.tts?.voice_id || '21m00Tcm4TlvDq8ikWAM',
            model: a.conversation_config?.tts?.model_id || 'eleven_flash_v2_5',
          },
          model: {
            model: a.conversation_config?.agent?.prompt?.llm || 'gpt-4o',
            systemPrompt: a.conversation_config?.agent?.prompt?.prompt || '',
          },
          firstMessage: a.conversation_config?.agent?.first_message || '',
          language: a.conversation_config?.agent?.language || 'en',
        }));
      }
    } catch {
      // Fallback gracefully
    }
    return [];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (key) {
      try {
        const res = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': key },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.voices && Array.isArray(data.voices)) {
            return data.voices.map((v: any) => ({
              id: v.voice_id,
              name: v.name,
              provider: 'ElevenLabs',
              accent: v.labels?.accent || v.labels?.['accent / dialect'] || (v.labels?.gender ? `${v.labels.gender} Natural` : 'Global English'),
              gender: v.labels?.gender ? (v.labels.gender.toLowerCase() === 'male' ? 'Male' : 'Female') : 'Female',
              tags: [v.category, v.labels?.use_case, v.labels?.description].filter(Boolean),
              previewUrl: v.preview_url,
              previewText: `Hello! I am ${v.name}, sharing exclusive real estate opportunities with you.`,
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    return [
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Warm & Professional)', provider: 'ElevenLabs', accent: 'American Professional', gender: 'Female', previewText: 'Hi, I am calling with an exclusive VIP invitation for Skyline Vista.' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Calm & Energetic)', provider: 'ElevenLabs', accent: 'Indian / Global English', gender: 'Female', previewText: 'Hello! Let me share the floor plans and pricing for the luxury 3BHK residences.' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Persuasive Executive)', provider: 'ElevenLabs', accent: 'British Professional', gender: 'Female', previewText: 'Good day! I am reaching out regarding the pre-launch discount on DLF Privana.' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Executive Consultant)', provider: 'ElevenLabs', accent: 'American Corporate', gender: 'Male', previewText: 'Hello, this is your premier advisor for commercial inventory.' },
    ];
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    return [
      {
        providerCallId: payload.conversation_id || 'unknown',
        recipientPhone: payload.phone_number || '',
        disposition: payload.status === 'completed' ? 'COMPLETED' : 'FAILED',
        durationSec: payload.duration_seconds || 0,
        recordingUrl: payload.recording_url,
        transcript: payload.transcript,
        summary: payload.summary,
        sentiment: payload.sentiment === 'positive' ? 'POSITIVE' : 'NEUTRAL',
        timestamp: new Date(),
      },
    ];
  }
}
