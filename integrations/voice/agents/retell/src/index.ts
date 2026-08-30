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

export class RetellAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'RETELL';

  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.RETELL_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;

    try {
      const res = await fetch('https://api.retellai.com/get-agent', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      return res.status === 200 || res.status === 404;
    } catch {
      return key.startsWith('key_') || key.length >= 20;
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
      return { success: false, error: 'Missing Retell AI API Key' };
    }

    try {
      const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_number: options.fromNumber,
          to_number: options.toPhone,
          override_agent_id: options.voiceId || 'agent_default',
          retell_llm_dynamic_variables: {
            ...options.variables,
            script_prompt: options.scriptPrompt,
          },
        }),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.call_id || `retell_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.message || `Retell dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via Retell AI',
      };
    }
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload || payload.event !== 'call_ended') return [];

    const call = payload.call || payload;
    const providerCallId = call.call_id || 'unknown';
    const recipientPhone = call.to_number || '';

    let disposition: any = 'COMPLETED';
    if (call.disconnection_reason === 'dial_no_answer') disposition = 'NO_ANSWER';
    else if (call.disconnection_reason === 'dial_busy') disposition = 'BUSY';
    else if (call.disconnection_reason === 'voicemail_reached') disposition = 'VOICEMAIL';

    const durationSec = Math.round(((call.end_timestamp - call.start_timestamp) / 1000) || 0);

    return [
      {
        providerCallId,
        recipientPhone,
        disposition,
        durationSec,
        recordingUrl: call.recording_url,
        transcript: call.transcript,
        summary: call.call_analysis?.call_summary,
        sentiment: call.call_analysis?.user_sentiment === 'Positive' ? 'POSITIVE' : 'NEUTRAL',
        extractedData: call.call_analysis?.custom_analysis_data || {},
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (key) {
      try {
        const res = await fetch('https://api.retellai.com/v2/list-retell-llms', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (Array.isArray(data) && data.length > 0) {
            const dynamicLlms: VoiceModelItem[] = data.map((llm: any) => ({
              id: llm.llm_id || llm.id,
              name: llm.model || llm.general_prompt?.substring(0, 30) || 'Custom Retell LLM',
              provider: llm.model?.includes('claude') ? 'Anthropic' : 'OpenAI',
              badge: 'Account Configured',
              description: `Retell Managed LLM (${llm.model || 'Custom'})`,
            }));
            return dynamicLlms;
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Retell Fast)', provider: 'OpenAI', badge: 'Recommended', description: 'Low latency real-time conversation (~120ms)' },
      { id: 'gpt-4o', name: 'GPT-4o (Retell Reasoning)', provider: 'OpenAI', badge: 'High Intelligence', description: 'Advanced objection handling and negotiation' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Super Smart', description: 'Top-tier complex real estate sales dialogue' },
      { id: 'retell-custom-llm', name: 'Retell Custom LLM Webhook', provider: 'Retell', badge: 'Enterprise Custom', description: 'Route dialogue to your private backend LLM' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (key) {
      try {
        const res = await fetch('https://api.retellai.com/list-voices', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (Array.isArray(data)) {
            return data.map((v: any) => ({
              id: v.voice_id,
              name: v.voice_name || v.voice_id,
              provider: v.provider || 'Retell',
              accent: v.accent || 'Global English',
              gender: v.gender || 'Female',
              tags: [v.provider, v.accent].filter(Boolean),
              previewUrl: v.preview_audio_url,
              previewText: 'Hello! I am excited to connect with you regarding prime luxury properties.',
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    return [
      { id: '11labs-Adrian', name: 'Adrian (Energetic Sales)', provider: 'Retell', accent: 'American Professional', gender: 'Male', previewText: 'Hi, this is Adrian with Skyline Realty regarding your project inquiry.' },
      { id: '11labs-Chloe', name: 'Chloe (Warm & Polite)', provider: 'Retell', accent: 'British Executive', gender: 'Female', previewText: 'Hello! I am calling to confirm your site visit for this weekend.' },
      { id: 'deepgram-Asteria', name: 'Asteria (Ultra Fast)', provider: 'Retell', accent: 'Neutral Professional', gender: 'Female', previewText: 'Good day! Would you like to review the updated payment plan?' },
    ];
  }
}
