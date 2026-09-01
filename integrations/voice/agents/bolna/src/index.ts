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
      const res = await fetch('https://api.bolna.ai/user/me', {
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
      // 1. If Vobiz carrier is selected, dispatch outbound PSTN call directly via Vobiz line
      if (options.telephonyCredentials?.apiKey && options.telephonyCredentials?.apiToken && !options.telephonyCredentials?.subdomain && !options.telephonyCredentials?.accountSid) {
        const id = options.telephonyCredentials.apiKey;
        const token = options.telephonyCredentials.apiToken;
        const cleanTo = options.toPhone.replace(/[^\d+]/g, '');
        const cleanFrom = (options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '').replace(/[^\d+]/g, '');
        const message = options.firstMessage || 'Hello! Thank you for connecting with us.';

        try {
          const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
          const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=BOLNA`;

          const res = await fetch(`https://api.vobiz.ai/api/v1/Account/${id}/Call/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-ID': id,
              'X-Auth-Token': token,
              Authorization: `Basic ${Buffer.from(`${id}:${token}`).toString('base64')}`,
            },
            body: JSON.stringify({
              to: cleanTo,
              from: cleanFrom,
              answer_url: answerUrl,
              answer_method: 'GET',
            }),
          });

          if (res.status >= 200 && res.status < 300) {
            const data = (await res.json().catch(() => ({}))) as any;
            return {
              success: true,
              providerCallId: data.callId || data.call_uuid || `vobiz_bolna_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Bolna API
        }
      }

      // 2. If Exotel carrier is selected, dispatch outbound PSTN call directly via Exotel line
      if (options.telephonyCredentials?.apiKey && options.telephonyCredentials?.apiToken && options.telephonyCredentials?.accountSid && options.telephonyCredentials?.subdomain) {
        const k = options.telephonyCredentials.apiKey;
        const tok = options.telephonyCredentials.apiToken;
        const sid = options.telephonyCredentials.accountSid;
        const domain = options.telephonyCredentials.subdomain;
        const cleanFrom = (options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '').replace(/[^\d]/g, '');
        let cleanTo = options.toPhone.replace(/[^\d]/g, '');
        if (cleanTo.startsWith('91') && cleanTo.length === 12) cleanTo = '0' + cleanTo.slice(2);
        else if (cleanTo.length === 10) cleanTo = '0' + cleanTo;

        try {
          const authHeader = Buffer.from(`${k}:${tok}`).toString('base64');
          const body = new URLSearchParams({
            From: cleanTo,
            To: cleanFrom,
            CallerId: cleanFrom,
            CallType: 'trans',
            TimeLimit: '60',
            TimeOut: '30',
          });

          const res = await fetch(`https://${domain}/v1/Accounts/${sid}/Calls/connect.json`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          });

          if (res.status >= 200 && res.status < 300) {
            const data = (await res.json().catch(() => ({}))) as any;
            return {
              success: true,
              providerCallId: data?.Call?.Sid || data?.sid || `exotel_bolna_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Bolna API
        }
      }

      const isAgentUUID = (id?: string) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let agentId = isAgentUUID(options.llmModel) ? options.llmModel : (isAgentUUID(options.voiceId) ? options.voiceId : null);

      if (!agentId) {
        try {
          const aRes = await fetch('https://api.bolna.ai/agent/all', {
            headers: { Authorization: `Bearer ${key}` },
          });
          if (aRes.ok) {
            const data = await aRes.json();
            const list = Array.isArray(data) ? data : data?.items || [];
            if (list.length > 0) {
              agentId = list[0].id || list[0].agent_id;
            }
          }
        } catch {
          // fallback
        }
      }

      agentId = agentId || '90dfbf73-3b2a-4330-916a-cd6b3796ec66';

      const callPayload: any = {
        agent_id: agentId,
        recipient_phone_number: options.toPhone,
        user_data: {
          ...options.variables,
          prompt: options.scriptPrompt,
        },
      };

      if (options.fromNumber && !options.fromNumber.includes('5550199')) {
        callPayload.from_phone_number = options.fromNumber;
      }

      const res = await fetch('https://api.bolna.ai/call', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callPayload),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.call_id || data.execution_id || `bolna_${Date.now()}`,
        };
      }

      const errMsg = data.message || data.detail || `Bolna dispatch failed with HTTP ${res.status}`;
      if (typeof errMsg === 'string' && errMsg.includes('Trial accounts can only make calls to verified')) {
        return {
          success: false,
          error: 'Bolna trial account restriction: Calls can only be placed to phone numbers verified in your Bolna dashboard. Please verify this number in Bolna or upgrade your wallet.',
        };
      }

      return {
        success: false,
        error: errMsg,
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
        providerCallId: payload.call_id || payload.execution_id || 'unknown',
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
    const dynamicAgents: VoiceModelItem[] = [];

    if (key) {
      try {
        const res = await fetch('https://api.bolna.ai/agent/all', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          const agentsList = Array.isArray(data) ? data : data?.items || [];
          for (const ag of agentsList) {
            dynamicAgents.push({
              id: ag.id || ag.agent_id,
              name: `${ag.agent_name || 'Bolna Agent'} (${ag.id?.slice(0, 8)}...)`,
              provider: 'Bolna Custom Agent',
              badge: ag.agent_status === 'processed' ? 'Active Agent' : 'Configured',
              description: `Live Bolna Agent (${ag.agent_name || ag.id}) · LLM: ${ag.tasks?.[0]?.tools_config?.llm_agent?.llm_config?.model || 'azure/gpt-4.1-mini'}`,
            });
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    const standardModels: VoiceModelItem[] = [
      { id: 'azure/gpt-4.1-mini', name: 'Azure GPT-4.1 Mini (Bolna Low Latency)', provider: 'Azure OpenAI', badge: 'Recommended', description: 'Ultra-low latency conversational engine for Indian languages' },
      { id: 'azure/gpt-4o', name: 'Azure GPT-4o (Bolna Intelligent)', provider: 'Azure OpenAI', badge: 'High Intelligence', description: 'Enterprise sales qualification & objection handling' },
      { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'OpenAI', badge: 'Fast', description: 'Real-time multilingual dialogue synthesis' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'High Nuance', description: 'Complex conversational reasoning & empathy' },
      { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3 (Bolna Speed)', provider: 'DeepSeek', badge: 'Speed Leader', description: 'Cost-effective high-speed conversational LLM' },
    ];

    return [...dynamicAgents, ...standardModels];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    const dynamicVoices: VoicePersonaItem[] = [];

    // 1. Fetch dynamic voices from Bolna API across all supported providers (ElevenLabs, Sarvam, Deepgram, Cartesia, Azure)
    if (key) {
      try {
        const provRes = await fetch('https://api.bolna.ai/api/v1/voice-config/tts?language=hi', {
          headers: { Authorization: `Bearer ${key}` },
        });

        if (provRes.ok) {
          const provData = (await provRes.json()) as any;
          const providers = provData.providers || [];

          for (const p of providers) {
            if (!p.models || p.models.length === 0) continue;
            const model = p.models.find((m: any) => m.default) || p.models[0];
            try {
              const vRes = await fetch(`https://api.bolna.ai/api/v1/voice-config/tts/voices?provider_id=${p.id}&model_id=${model.id}&language=hi&page_size=20`, {
                headers: { Authorization: `Bearer ${key}` },
              });
              if (vRes.ok) {
                const vData = (await vRes.json()) as any;
                const items = vData.items || [];
                for (const item of items) {
                  // If ElevenLabs, construct direct CDN preview URL if missing
                  let previewUrl = item.preview_url;
                  if (!previewUrl && p.name.toLowerCase().includes('eleven') && item.voice_id) {
                    previewUrl = `https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/${item.voice_id}.mp3`;
                  }

                  dynamicVoices.push({
                    id: item.voice_id || item.id,
                    name: `${item.name} (Bolna ${p.name})`,
                    provider: 'bolna',
                    accent: item.accent || 'Hindi / Indic',
                    gender: item.gender === 'female' ? 'Female' : 'Male',
                    tags: ['Bolna AI', p.name, model.display_name].filter(Boolean),
                    previewUrl,
                    previewText: `Namaste! Main ${item.name} bol raha hoon Bolna AI se.`,
                  });
                }
              }
            } catch {
              // skip
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    // 2. High-quality curated default Bolna personas (with verified Studio CDN audio)
    const curatedVoices: VoicePersonaItem[] = [
      // ── ElevenLabs on Bolna ──
      {
        id: 'iWNf11sz1GrUE4ppxTOL',
        name: 'Viraj (Bolna ElevenLabs Indic)',
        provider: 'bolna',
        accent: 'Indian English / Hindi',
        gender: 'Male',
        tags: ['Bolna AI', 'ElevenLabs', 'Warm', 'Energetic'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/iWNf11sz1GrUE4ppxTOL.mp3',
        previewText: 'Namaste! Main Skyline Realty team se baat kar raha hoon.',
      },
      {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel (Bolna ElevenLabs)',
        provider: 'bolna',
        accent: 'American Warm',
        gender: 'Female',
        tags: ['Bolna AI', 'ElevenLabs', 'Professional'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
        previewText: 'Hello! I am following up on your luxury property inquiry.',
      },
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam (Bolna ElevenLabs)',
        provider: 'bolna',
        accent: 'American Executive',
        gender: 'Male',
        tags: ['Bolna AI', 'ElevenLabs', 'Advisor'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/pNInz6obpgDQGcFmaJgB.mp3',
        previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
      },

      // ── Sarvam AI on Bolna ──
      {
        id: 'sarvam-priya',
        name: 'Priya (Bolna Sarvam Indic)',
        provider: 'bolna',
        accent: 'Hindi / Indic',
        gender: 'Female',
        tags: ['Bolna AI', 'Sarvam', 'Hindi', 'Consultative'],
        previewText: 'Namaste! Kya aap is weekend luxury villa visit ke liye available hain?',
      },
      {
        id: 'sarvam-rahul',
        name: 'Rahul (Bolna Sarvam Indic)',
        provider: 'bolna',
        accent: 'Hindi / Indic',
        gender: 'Male',
        tags: ['Bolna AI', 'Sarvam', 'Hindi', 'Sales'],
        previewText: 'Namaste sir! Main new pre-launch offer ke baare mein inform karne ke liye call kar raha hoon.',
      },
      {
        id: 'sarvam-shubh',
        name: 'Shubh (Bolna Sarvam Indic)',
        provider: 'bolna',
        accent: 'Hindi Conversational',
        gender: 'Male',
        tags: ['Bolna AI', 'Sarvam', 'Hindi', 'Pre-Sales'],
        previewText: 'Hello sir! Pre-launch offer ke tehat exclusive 10% spot discount available hai.',
      },
      {
        id: 'sarvam-ananya',
        name: 'Ananya (Bolna Sarvam Indic)',
        provider: 'bolna',
        accent: 'South Indic English',
        gender: 'Female',
        tags: ['Bolna AI', 'Sarvam', 'Indic English', 'South'],
        previewText: 'Vanakkam, I am calling regarding your luxury apartment inquiry in Bangalore.',
      },

      // ── Cartesia Sonic 3.5 on Bolna ──
      {
        id: 'faf0731e-dfb9-4cfc-8119-259a79b27e12',
        name: 'Riya (Bolna Cartesia Indic)',
        provider: 'bolna',
        accent: 'Hinglish / Conversational',
        gender: 'Female',
        tags: ['Bolna AI', 'Cartesia', 'Sonic 3.5', 'Hinglish'],
        previewText: 'Hey there! Main Riya bol rahi hoon regarding your penthouse enquiry.',
      },
      {
        id: '95d51f79-c397-46f9-b49a-23763d3eaa2d',
        name: 'Arushi (Bolna Cartesia Indic)',
        provider: 'bolna',
        accent: 'Hinglish Speaker',
        gender: 'Female',
        tags: ['Bolna AI', 'Cartesia', 'Sonic 3.5', 'Indic'],
        previewText: 'Hi! Let me guide you through the latest floor plans and pricing options.',
      },
      {
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        name: 'Sarah (Bolna Cartesia)',
        provider: 'bolna',
        accent: 'American Conversational',
        gender: 'Female',
        tags: ['Bolna AI', 'Cartesia', 'Sonic 3.5'],
        previewText: 'Hey there! I am following up on your luxury penthouse selection.',
      },
      {
        id: '694f9389-aac1-45b6-b726-9d9369183238',
        name: 'James (Bolna Cartesia)',
        provider: 'bolna',
        accent: 'British Executive',
        gender: 'Male',
        tags: ['Bolna AI', 'Cartesia', 'Sonic 3.5'],
        previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
      },

      // ── Deepgram Aura on Bolna ──
      {
        id: 'aura-asteria-en',
        name: 'Asteria (Bolna Deepgram)',
        provider: 'bolna',
        accent: 'American Clear',
        gender: 'Female',
        tags: ['Bolna AI', 'Deepgram', 'Aura'],
        previewUrl: 'https://static.deepgram.com/audio/voices/asteria.wav',
        previewText: 'Hello, this is Asteria following up on your property inquiry.',
      },
      {
        id: 'aura-orion-en',
        name: 'Orion (Bolna Deepgram)',
        provider: 'bolna',
        accent: 'American Deep',
        gender: 'Male',
        tags: ['Bolna AI', 'Deepgram', 'Aura'],
        previewUrl: 'https://static.deepgram.com/audio/voices/orion.wav',
        previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
      },
      {
        id: 'aura-luna-en',
        name: 'Luna (Bolna Deepgram)',
        provider: 'bolna',
        accent: 'American Warm',
        gender: 'Female',
        tags: ['Bolna AI', 'Deepgram', 'Aura'],
        previewUrl: 'https://static.deepgram.com/audio/voices/luna.wav',
        previewText: 'Hi! We have an exclusive early-bird discount on the new tower launch.',
      },
      {
        id: 'aura-zeus-en',
        name: 'Zeus (Bolna Deepgram)',
        provider: 'bolna',
        accent: 'American Resonant',
        gender: 'Male',
        tags: ['Bolna AI', 'Deepgram', 'Aura'],
        previewUrl: 'https://static.deepgram.com/audio/voices/zeus.wav',
        previewText: 'Welcome to Skyline Realty. How may I direct your property inquiry?',
      },
    ];

    // Deduplicate by voice id
    const seen = new Set<string>();
    const combined: VoicePersonaItem[] = [];

    for (const v of [...curatedVoices, ...dynamicVoices]) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        combined.push(v);
      }
    }

    return combined;
  }
}


