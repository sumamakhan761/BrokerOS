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
  private serverUrl: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.LIVEKIT_API_KEY || '';
    this.serverUrl = credentials?.serverUrl || process.env.LIVEKIT_URL || 'https://livekit.cloud';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    return !!key && key.length >= 16;
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
      { id: 'livekit-agents-pipeline', name: 'LiveKit Python Agents Framework', provider: 'LiveKit', badge: 'Ultra Low Latency WebRTC', description: 'Real-time bidirectional audio streaming worker' },
      { id: 'gpt-4o-mini-livekit', name: 'GPT-4o Mini (LiveKit Engine)', provider: 'OpenAI', badge: 'High Concurrency', description: 'Optimized for high-volume outbound campaigns' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return [
      { id: 'cartesia-sonic', name: 'Sonic (Cartesia Ultra-Fast)', provider: 'LiveKit', accent: 'American Professional', gender: 'Female', previewText: 'Hi, this is your Skyline Realty agent with exclusive pre-launch booking offers.' },
      { id: 'eleven-adam', name: 'Adam (Executive Voice)', provider: 'LiveKit', accent: 'American Deep', gender: 'Male', previewText: 'Hello sir, would you like to review the floor plans on your email?' },
    ];
  }
}
