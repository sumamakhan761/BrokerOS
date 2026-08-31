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

export class LiveKitAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'LIVEKIT';

  private apiKey: string;
  private apiSecret: string;
  private serverUrl: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = credentials?.apiSecret || process.env.LIVEKIT_API_SECRET || '';
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

    try {
      const roomName = `campaign_${options.campaignId}_${Date.now()}`;
      const res = await fetch(`${this.serverUrl}/twirp/livekit.SIP/CreateSIPParticipant`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sip_trunk_id: options.telephonyCredentials?.accountSid || 'default_trunk',
          sip_call_to: options.toPhone,
          room_name: roomName,
          participant_identity: `lead_${options.toPhone}`,
          participant_name: options.variables?.firstName || 'Lead',
        }),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.sip_call_id || data.participant_id || `lk_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.msg || `LiveKit SIP dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via LiveKit',
      };
    }
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    return [
      {
        providerCallId: payload.sip_call_id || payload.id || 'unknown',
        recipientPhone: payload.phone_number || '',
        disposition: 'COMPLETED',
        durationSec: payload.duration || 0,
        transcript: payload.transcript,
        sentiment: 'NEUTRAL',
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return [
      { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B (LiveKit Recommended)', provider: 'LiveKit Inference', badge: 'Default LLM', description: 'Latency-optimized open-weight model served directly on LiveKit infrastructure' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (LiveKit Engine)', provider: 'OpenAI', badge: 'High Speed', description: 'Ultra-low latency conversational orchestrator for high concurrency' },
      { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'Azure / OpenAI', badge: 'Balanced', description: 'High precision dialogue handling with structured tool calling' },
      { id: 'google/gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google', badge: 'Low Latency', description: 'Sub-second real-time conversational reasoning' },
      { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'Baseten', badge: 'Speed Leader', description: 'Cost-effective high-intelligence reasoning model' },
      { id: 'openai/realtime', name: 'OpenAI Realtime API (Speech-to-Speech)', provider: 'OpenAI', badge: 'Multimodal', description: 'End-to-end direct speech comprehension without cascade latency' },
      { id: 'gemini/live', name: 'Gemini Live API', provider: 'Google', badge: 'Realtime Audio', description: 'Direct audio-in audio-out conversational framework' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return [
      // ── Cartesia Sonic on LiveKit ──
      {
        id: 'cartesia/sonic-3:a167e0f3-df7e-4d52-a9c3-f949145efdab',
        name: 'Blake (Cartesia Sonic 3)',
        provider: 'LiveKit Cartesia',
        accent: 'American Adult Male',
        gender: 'Male',
        tags: ['LiveKit', 'Cartesia', 'Sonic 3', 'Energetic'],
        previewText: 'Hi, this is Blake from Skyline Realty. Are you looking to schedule a site visit this weekend?',
      },
      {
        id: 'cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
        name: 'Jacqueline (Cartesia Sonic 3)',
        provider: 'LiveKit Cartesia',
        accent: 'American Adult Female',
        gender: 'Female',
        tags: ['LiveKit', 'Cartesia', 'Sonic 3', 'Confident'],
        previewText: 'Hello! I am following up on your luxury penthouse selection at Signature Towers.',
      },

      // ── Deepgram Aura on LiveKit ──
      {
        id: 'deepgram/aura-2:apollo',
        name: 'Apollo (Deepgram Aura 2)',
        provider: 'LiveKit Deepgram',
        accent: 'American Casual Male',
        gender: 'Male',
        tags: ['LiveKit', 'Deepgram', 'Aura 2', 'Comfortable'],
        previewUrl: 'https://static.deepgram.com/audio/voices/apollo.wav',
        previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
      },
      {
        id: 'deepgram/aura-2:athena',
        name: 'Athena (Deepgram Aura 2)',
        provider: 'LiveKit Deepgram',
        accent: 'American Professional Female',
        gender: 'Female',
        tags: ['LiveKit', 'Deepgram', 'Aura 2', 'Smooth'],
        previewUrl: 'https://static.deepgram.com/audio/voices/athena.wav',
        previewText: 'Hello, this is Athena from Skyline Realty with exclusive pre-launch booking offers.',
      },
      {
        id: 'deepgram/aura-2:asteria',
        name: 'Asteria (Deepgram Aura 2)',
        provider: 'LiveKit Deepgram',
        accent: 'American Clear Female',
        gender: 'Female',
        tags: ['LiveKit', 'Deepgram', 'Aura 2', 'Crisp'],
        previewUrl: 'https://static.deepgram.com/audio/voices/asteria.wav',
        previewText: 'Welcome to Skyline Realty. How may I direct your property inquiry today?',
      },

      // ── Fish Audio on LiveKit ──
      {
        id: 'fishaudio/s2.1-pro:bf322df2096a46f18c579d0baa36f41d',
        name: 'Adrian (Fish Audio S2.1)',
        provider: 'LiveKit Fish Audio',
        accent: 'American Friendly Male',
        gender: 'Male',
        tags: ['LiveKit', 'Fish Audio', 'S2.1 Pro', 'Casual'],
        previewText: 'Hey there! Let me walk you through the unit options and floor layouts.',
      },
      {
        id: 'fishaudio/s2.1-pro:9a9cf47702da476aa4629e2506d4a857',
        name: 'Hannah (Fish Audio S2.1)',
        provider: 'LiveKit Fish Audio',
        accent: 'American Conversational Female',
        gender: 'Female',
        tags: ['LiveKit', 'Fish Audio', 'S2.1 Pro', 'Conversational'],
        previewText: 'Hello! I am calling to confirm your site visit appointment this Saturday.',
      },

      // ── ElevenLabs on LiveKit ──
      {
        id: 'elevenlabs:iWNf11sz1GrUE4ppxTOL',
        name: 'Viraj (ElevenLabs Indic)',
        provider: 'LiveKit ElevenLabs',
        accent: 'Indian English / Hindi',
        gender: 'Male',
        tags: ['LiveKit', 'ElevenLabs', 'Indic', 'Energetic'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/iWNf11sz1GrUE4ppxTOL.mp3',
        previewText: 'Namaste! Main Skyline Realty team se call kar raha hoon.',
      },
      {
        id: 'elevenlabs:21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel (ElevenLabs)',
        provider: 'LiveKit ElevenLabs',
        accent: 'American Warm Female',
        gender: 'Female',
        tags: ['LiveKit', 'ElevenLabs', 'Professional'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
        previewText: 'Hello! I am following up on your luxury apartment inquiry.',
      },

      // ── Inworld & xAI on LiveKit ──
      {
        id: 'inworld/inworld-tts-1:Ashley',
        name: 'Ashley (Inworld TTS)',
        provider: 'LiveKit Inworld',
        accent: 'American Natural Female',
        gender: 'Female',
        tags: ['LiveKit', 'Inworld', 'Natural'],
        previewText: 'Hi, I can assist you with unit availability and current pre-launch discounts.',
      },
      {
        id: 'xai/tts-1:ara',
        name: 'Ara (xAI Voice)',
        provider: 'LiveKit xAI',
        accent: 'American Warm Female',
        gender: 'Female',
        tags: ['LiveKit', 'xAI', 'Warm'],
        previewText: 'Hello! Welcome to Skyline Realty property consultation.',
      },
    ];
  }
}
