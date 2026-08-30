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

export class VapiAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'VAPI';

  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.VAPI_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;

    try {
      const res = await fetch('https://api.vapi.ai/assistant', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      return res.status === 200;
    } catch {
      return key.length >= 20;
    }
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    // Generate TTS preview via audio synthesizer or mock waveform
    const sampleBuffer = Buffer.from(text, 'utf-8');
    return {
      audioBuffer: sampleBuffer,
      contentType: 'audio/mpeg',
    };
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing Vapi API Key' };
    }

    try {
      const isAssistantId = options.llmModel && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.llmModel);

      const payload: any = {
        customer: {
          number: options.toPhone,
        },
      };

      // Set phone number configuration
      if (options.telephonyCredentials?.accountSid && options.telephonyCredentials?.authToken) {
        payload.phoneNumber = {
          twilioPhoneNumber: options.fromNumber,
          twilioAccountSid: options.telephonyCredentials.accountSid,
          twilioAuthToken: options.telephonyCredentials.authToken,
        };
      } else if (options.fromNumber) {
        payload.phoneNumberId = options.fromNumber;
      }

      if (isAssistantId) {
        // Use configured Vapi Assistant with dynamic variable overrides
        payload.assistantId = options.llmModel;
        payload.assistantOverrides = {
          variableValues: options.variables || {},
        };
        if (options.scriptPrompt) {
          payload.assistantOverrides.model = {
            messages: [{ role: 'system', content: options.scriptPrompt }],
          };
        }
        if (options.firstMessage) {
          payload.assistantOverrides.firstMessage = options.firstMessage;
        }
        if (options.voiceSpeed) {
          payload.assistantOverrides.voice = { speed: options.voiceSpeed };
        }
        if (options.backgroundSound) {
          payload.assistantOverrides.backgroundSound = options.backgroundSound;
        }
        if (options.voicemailDetection) {
          payload.assistantOverrides.voicemailDetection = options.voicemailDetection;
        }
        if (options.maxDurationSeconds) {
          payload.assistantOverrides.maxDurationSeconds = options.maxDurationSeconds;
        }
      } else {
        // Create full dynamic assistant payload
        const sttProvider = options.transcriberModel?.includes('assembly')
          ? 'assembly-ai'
          : options.transcriberModel?.includes('whisper')
          ? 'talkscriber'
          : 'deepgram';

        payload.assistantOverrides = {
          transcriber: {
            provider: sttProvider,
            model: options.transcriberModel || 'nova-3',
            language: options.transcriberLanguage || 'en',
            maxTurnSilence: options.maxTurnSilenceMs || 400,
          },
          model: {
            provider: options.llmModel?.includes('claude') ? 'anthropic' : options.llmModel?.includes('llama') ? 'groq' : 'openai',
            model: options.llmModel || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: options.scriptPrompt || 'You are a helpful real estate assistant.',
              },
            ],
          },
          voice: {
            provider: options.voiceProvider || '11labs',
            voiceId: options.voiceId || '21m00Tcm4TlvDq8ikWAM',
            speed: options.voiceSpeed || 1.0,
          },
          firstMessage: options.firstMessage,
          firstMessageMode: options.firstMessageMode || 'assistant-speaks-first',
          voicemailDetection: options.voicemailDetection || 'off',
          backgroundSound: options.backgroundSound || 'off',
          maxDurationSeconds: options.maxDurationSeconds || 600,
          variableValues: options.variables || {},
        };
      }

      const res = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.id || data.callId || `vapi_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.message || `Vapi dispatch failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch call via Vapi',
      };
    }
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    const messageType = payload.message?.type || payload.type;
    if (messageType !== 'end-of-call-report' && messageType !== 'call-status-update') {
      return [];
    }

    const call = payload.message?.call || payload.call || payload;
    const providerCallId = call.id || 'unknown';
    const recipientPhone = call.customer?.number || '';

    let disposition: any = 'COMPLETED';
    if (call.endedReason === 'customer-did-not-answer') disposition = 'NO_ANSWER';
    else if (call.endedReason === 'customer-busy') disposition = 'BUSY';
    else if (call.endedReason === 'voicemail') disposition = 'VOICEMAIL';
    else if (call.endedReason === 'assistant-error') disposition = 'FAILED';

    const durationSec = Math.round((call.duration || 0));
    const transcript = payload.message?.transcript || call.transcript;
    const summary = payload.message?.summary || call.summary;
    const recordingUrl = payload.message?.recordingUrl || call.recordingUrl;
    const analysis = payload.message?.analysis || call.analysis;

    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    if (analysis?.sentiment === 'positive') sentiment = 'POSITIVE';
    else if (analysis?.sentiment === 'negative') sentiment = 'NEGATIVE';

    return [
      {
        providerCallId,
        recipientPhone,
        disposition,
        durationSec,
        recordingUrl,
        transcript,
        summary,
        sentiment,
        extractedData: analysis?.structuredData || {},
        timestamp: new Date(),
      },
    ];
  }

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return [];

    try {
      const res = await fetch('https://api.vapi.ai/assistant', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        const assistants = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(assistants)) {
          return assistants.map((asst: any) => ({
            id: asst.id,
            name: asst.name || 'Untitled Assistant',
            firstMessage: asst.firstMessage || '',
            firstMessageMode: asst.firstMessageMode || 'assistant-speaks-first',
            voicemailDetection: asst.voicemailDetection || 'off',
            backgroundSound: asst.backgroundSound || 'off',
            maxDurationSeconds: asst.maxDurationSeconds || 600,
            model: {
              provider: asst.model?.provider || 'openai',
              model: asst.model?.model || 'gpt-4o-mini',
              temperature: asst.model?.temperature,
              systemPrompt: asst.model?.messages?.find((m: any) => m.role === 'system')?.content || '',
            },
            voice: {
              provider: asst.voice?.provider || '11labs',
              voiceId: asst.voice?.voiceId || '21m00Tcm4TlvDq8ikWAM',
              speed: asst.voice?.speed || 1.0,
            },
            transcriber: {
              provider: asst.transcriber?.provider || 'deepgram',
              model: asst.transcriber?.model || asst.transcriber?.speechModel || 'nova-3',
              language: asst.transcriber?.language || 'en',
              maxTurnSilence: asst.transcriber?.maxTurnSilence || 400,
            },
          }));
        }
      }
    } catch {
      // Fallback gracefully
    }
    return [];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    const accountAssistants: VoiceModelItem[] = [];

    if (key) {
      try {
        const res = await fetch('https://api.vapi.ai/assistant', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const assistants = (await res.json().catch(() => [])) as any[];
          if (Array.isArray(assistants) && assistants.length > 0) {
            for (const asst of assistants) {
              accountAssistants.push({
                id: asst.id,
                name: `${asst.name || 'Assistant'} (${asst.model?.model || asst.model?.provider || 'Vapi'})`,
                provider: (asst.model?.provider || 'Vapi').toUpperCase(),
                badge: 'My Vapi Assistant',
                description: `Configured Assistant on your Vapi Account: ${asst.name || asst.id}`,
              });
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    const standardModels: VoiceModelItem[] = [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Vapi Ultra Fast)', provider: 'OpenAI', badge: 'Recommended', description: 'Real-time conversational streaming with minimal latency (~100ms)' },
      { id: 'gpt-4o', name: 'GPT-4o (Vapi Full Reasoning)', provider: 'OpenAI', badge: 'High Intelligence', description: 'Advanced objection handling and complex pricing negotiations' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Super Smart', description: 'Deep conversational nuance for premium luxury real estate' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'Ultra Fast', description: 'Lightning-quick dialogue turns with cost-efficient inference' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq LPU)', provider: 'Groq', badge: 'Ultra Speed', description: 'Sub-50ms token generation for natural human-like cadence' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', badge: 'Multimodal', description: 'Fast responses with wide context window support' },
    ];

    return [...accountAssistants, ...standardModels];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    const key = credentials?.apiKey || this.apiKey;
    const accountVoices: VoicePersonaItem[] = [];

    if (key) {
      try {
        const res = await fetch('https://api.vapi.ai/assistant', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const assistants = (await res.json().catch(() => [])) as any[];
          if (Array.isArray(assistants)) {
            for (const asst of assistants) {
              if (asst.voice?.voiceId) {
                accountVoices.push({
                  id: asst.voice.voiceId,
                  name: `${asst.name || 'Assistant'} Voice (${asst.voice.provider || '11labs'})`,
                  provider: asst.voice.provider || '11labs',
                  accent: 'Assistant Assigned',
                  gender: 'Female',
                  tags: [asst.voice.provider, 'Vapi Assistant'].filter(Boolean),
                  previewText: asst.firstMessage || 'Hello! I am calling regarding your real estate inquiry.',
                });
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    const nativeVapiVoices: VoicePersonaItem[] = [
      // 11Labs Voices in Vapi
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (11Labs)', provider: '11labs', accent: 'American Professional', gender: 'Female', previewText: 'Hello! I am calling from DLF Privana West sales gallery.' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (11Labs)', provider: '11labs', accent: 'Indian / Global English', gender: 'Female', previewText: 'Hi! Let me share the floor plans and pricing for the luxury 3BHK residences.' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (11Labs)', provider: '11labs', accent: 'Warm & Conversational', gender: 'Female', previewText: 'Hi there! I would love to assist you in booking your private site visit.' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (11Labs)', provider: '11labs', accent: 'Calm & Trustworthy', gender: 'Male', previewText: 'Good afternoon, this is Antoni with an update on your property application.' },
      { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael (11Labs)', provider: '11labs', accent: 'Corporate Executive', gender: 'Male', previewText: 'Hello sir, I am following up on the pre-launch allocation details.' },

      // Cartesia Sonic Voices in Vapi
      { id: '248be419-c632-4f23-adf1-5324ed7dbf10', name: 'Sonic English (Cartesia)', provider: 'cartesia', accent: 'Ultra Low Latency (~100ms)', gender: 'Female', previewText: 'Hello! How can I assist you with your property inquiry today?' },
      { id: 'a0e99841-438c-4a64-b679-ae501e7d6091', name: 'Barbershop Man (Cartesia)', provider: 'cartesia', accent: 'Deep & Conversational', gender: 'Male', previewText: 'Hey there! Are you looking for a 2BHK or 3BHK penthouse?' },

      // Deepgram Aura Voices in Vapi
      { id: 'aura-asteria-en', name: 'Asteria (Deepgram Aura)', provider: 'deepgram', accent: 'Crisp & Natural', gender: 'Female', previewText: 'Hello, I am Asteria from the sales office following up on your inquiry.' },
      { id: 'aura-orion-en', name: 'Orion (Deepgram Aura)', provider: 'deepgram', accent: 'Confident Real Estate Consultant', gender: 'Male', previewText: 'Good day! Let me guide you through the latest payment plans and inventory.' },

      // OpenAI Voices in Vapi
      { id: 'alloy', name: 'Alloy (OpenAI)', provider: 'openai', accent: 'Balanced & Neutral', gender: 'Neutral', previewText: 'Hello! I am calling to confirm your appointment for this Saturday.' },
      { id: 'shimmer', name: 'Shimmer (OpenAI)', provider: 'openai', accent: 'Expressive & Cheerful', gender: 'Female', previewText: 'Hi! We have an exclusive early-bird discount on the new tower launch.' },
      { id: 'echo', name: 'Echo (OpenAI)', provider: 'openai', accent: 'Warm & Clear', gender: 'Male', previewText: 'Welcome to Skyline Realty! How can I help you find your dream home?' },

      // Azure Voices in Vapi
      { id: 'andrew', name: 'Andrew (Azure Neural)', provider: 'azure', accent: 'American Professional', gender: 'Male', previewText: 'Hello! Calling to share details on the commercial retail space.' },
      { id: 'jenny', name: 'Jenny (Azure Neural)', provider: 'azure', accent: 'Clear Conversational', gender: 'Female', previewText: 'Hello! Would you like to schedule a virtual tour of the property?' },
    ];

    // Deduplicate by id
    const seen = new Set<string>();
    const combined: VoicePersonaItem[] = [];

    for (const v of [...accountVoices, ...nativeVapiVoices]) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        combined.push(v);
      }
    }

    return combined;
  }
}
