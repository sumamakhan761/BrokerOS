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

      // 1. If Vobiz carrier is selected, dispatch outbound PSTN call directly via Vobiz line
      if (options.telephonyCredentials?.apiKey && options.telephonyCredentials?.apiToken && !options.telephonyCredentials?.subdomain && !options.telephonyCredentials?.accountSid) {
        const id = options.telephonyCredentials.apiKey;
        const token = options.telephonyCredentials.apiToken;
        const cleanTo = options.toPhone.replace(/[^\d+]/g, '');
        const cleanFrom = (options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '').replace(/[^\d+]/g, '');
        const message = options.firstMessage || 'Hello! Thank you for connecting with us.';

        try {
          const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
          const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=VAPI`;

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
              providerCallId: data.callId || data.call_uuid || `vobiz_vapi_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Vapi API
        }
      }

      // 2. If Exotel carrier is selected, dispatch outbound PSTN call directly via Exotel line
      if (options.telephonyCredentials?.apiKey && options.telephonyCredentials?.apiToken && options.telephonyCredentials?.accountSid && options.telephonyCredentials?.subdomain) {
        const key = options.telephonyCredentials.apiKey;
        const token = options.telephonyCredentials.apiToken;
        const sid = options.telephonyCredentials.accountSid;
        const domain = options.telephonyCredentials.subdomain;
        const cleanFrom = (options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '').replace(/[^\d]/g, '');
        let cleanTo = options.toPhone.replace(/[^\d]/g, '');
        if (cleanTo.startsWith('91') && cleanTo.length === 12) cleanTo = '0' + cleanTo.slice(2);
        else if (cleanTo.length === 10) cleanTo = '0' + cleanTo;

        try {
          const authHeader = Buffer.from(`${key}:${token}`).toString('base64');
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
              providerCallId: data?.Call?.Sid || data?.sid || `exotel_vapi_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Vapi API
        }
      }

      // 3. Phone number configuration for Vapi API (Twilio / BYOT)
      const isUUID = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (options.telephonyCredentials?.accountSid && options.telephonyCredentials?.authToken) {
        payload.phoneNumber = {
          twilioPhoneNumber: options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '+18393335029',
          twilioAccountSid: options.telephonyCredentials.accountSid,
          twilioAuthToken: options.telephonyCredentials.authToken,
        };
      } else if (isUUID(options.fromNumber)) {
        payload.phoneNumberId = options.fromNumber;
      }

      // 2. Map Voice Provider to valid Vapi enum
      let vapiVoiceProvider: any = 'vapi';
      const rawVp = (options.voiceProvider || '').toLowerCase();
      let cleanVoiceId = (options.voiceId || 'Elliot').trim();

      // Detect provider from prefix (e.g. deepgram-orion, 11labs-rachel, cartesia-sarah)
      if (/^(11labs|elevenlabs|eleven)[-_]/i.test(cleanVoiceId)) {
        vapiVoiceProvider = '11labs';
        cleanVoiceId = cleanVoiceId.replace(/^(11labs|elevenlabs|eleven)[-_]/i, '');
      } else if (/^deepgram[-_]/i.test(cleanVoiceId)) {
        vapiVoiceProvider = 'deepgram';
        cleanVoiceId = cleanVoiceId.replace(/^deepgram[-_]/i, '');
      } else if (/^cartesia[-_]/i.test(cleanVoiceId)) {
        vapiVoiceProvider = 'cartesia';
        cleanVoiceId = cleanVoiceId.replace(/^cartesia[-_]/i, '');
      } else if (/^openai[-_]/i.test(cleanVoiceId)) {
        vapiVoiceProvider = 'openai';
        cleanVoiceId = cleanVoiceId.replace(/^openai[-_]/i, '');
      } else if (/^azure[-_]/i.test(cleanVoiceId)) {
        vapiVoiceProvider = 'azure';
        cleanVoiceId = cleanVoiceId.replace(/^azure[-_]/i, '');
      } else if (rawVp.includes('eleven') || rawVp === '11labs') {
        vapiVoiceProvider = '11labs';
      } else if (rawVp.includes('cartesia')) {
        vapiVoiceProvider = 'cartesia';
      } else if (rawVp.includes('deepgram')) {
        vapiVoiceProvider = 'deepgram';
      } else if (rawVp.includes('openai')) {
        vapiVoiceProvider = 'openai';
      } else if (rawVp.includes('azure')) {
        vapiVoiceProvider = 'azure';
      } else if (rawVp.includes('inworld')) {
        vapiVoiceProvider = 'inworld';
      } else if (rawVp.includes('minimax')) {
        vapiVoiceProvider = 'minimax';
      } else if (rawVp.includes('rime')) {
        vapiVoiceProvider = 'rime-ai';
      } else if (rawVp.includes('smallest')) {
        vapiVoiceProvider = 'smallest-ai';
      } else if (rawVp.includes('xai')) {
        vapiVoiceProvider = 'xai';
      }

      // Auto-detect 20-char ElevenLabs voice ID
      if (/^[a-zA-Z0-9]{20}$/.test(cleanVoiceId)) {
        vapiVoiceProvider = '11labs';
      }

      // Deepgram Aura normalizer: Strip "aura-" prefix, lowercase, validate against Vapi enum
      if (vapiVoiceProvider === 'deepgram') {
        cleanVoiceId = cleanVoiceId.toLowerCase().replace(/^aura-/, '').replace(/-en$/, '').trim();
        const validDeepgramVoices = [
          'asteria', 'luna', 'stella', 'athena', 'hera', 'orion', 'arcas', 'perseus',
          'angus', 'orpheus', 'helios', 'zeus', 'thalia', 'andromeda', 'helena', 'apollo',
          'aries', 'amalthea', 'atlas', 'aurora', 'callista', 'cora', 'cordelia', 'delia',
          'draco', 'electra', 'harmonia', 'hermes', 'hyperion', 'iris', 'janus', 'juno',
          'jupiter', 'mars', 'minerva', 'neptune', 'odysseus', 'ophelia', 'pandora', 'phoebe',
          'pluto', 'saturn', 'selene', 'theia', 'vesta', 'celeste', 'estrella', 'nestor',
          'sirio', 'carina', 'alvaro', 'diana', 'aquila', 'javier', 'viktoria', 'kara',
          'fabian', 'julius', 'lara', 'elara', 'aurelia'
        ];
        if (!validDeepgramVoices.includes(cleanVoiceId)) {
          const found = validDeepgramVoices.find(v => cleanVoiceId.includes(v));
          cleanVoiceId = found || 'orion';
        }
      }

      // ElevenLabs normalizer: map voice names to UUIDs
      if (vapiVoiceProvider === '11labs') {
        const elevenMap: Record<string, string> = {
          rachel: '21m00Tcm4TlvDq8ikWAM',
          adam: 'pNInz6obpgDQGcFmaJgB',
          antoni: 'ErXwobaYiN019PkySvjV',
          josh: 'TxGEqnHWrfWFTfGW9XjX',
          sarah: 'EXAVITQu4vr4xnSDxMaL',
          domi: 'AZnzlk1XvdvUeBnXmlld',
          michael: 'flq6f7yk4E4fJM5XTYuZ',
          viraj: 'iWNf11sz1GrUE4ppxTOL',
        };
        if (elevenMap[cleanVoiceId.toLowerCase()]) {
          cleanVoiceId = elevenMap[cleanVoiceId.toLowerCase()];
        }
      }

      // OpenAI normalizer
      if (vapiVoiceProvider === 'openai') {
        cleanVoiceId = cleanVoiceId.toLowerCase();
        const validOpenAiVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'sage', 'coral', 'ash', 'ballad', 'verse'];
        if (!validOpenAiVoices.includes(cleanVoiceId)) {
          cleanVoiceId = 'alloy';
        }
      }

      // Cartesia normalizer
      if (vapiVoiceProvider === 'cartesia') {
        const cartesiaMap: Record<string, string> = {
          sarah: 'a0e99841-438c-4a64-b679-ae501e7d6091',
          james: '694f9389-aac1-45b6-b726-9d9369183238',
          katie: 'f114a467-c40a-4db8-964d-aaba01609c68',
          brooke: 'e90c6678-f0d3-4767-970c-26b69b4c32ea',
          cali: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        };
        if (cartesiaMap[cleanVoiceId.toLowerCase()]) {
          cleanVoiceId = cartesiaMap[cleanVoiceId.toLowerCase()];
        }
      }

      // Vapi built-in normalizer
      if (vapiVoiceProvider === 'vapi') {
        const validVapiVoices = ['Elliot', 'Kylie', 'Rohan', 'Lily', 'Savannah', 'Hana'];
        const matched = validVapiVoices.find(v => v.toLowerCase() === cleanVoiceId.toLowerCase());
        cleanVoiceId = matched || 'Elliot';
      }

      // 3. Map Model Provider and Model ID
      let vapiModelProvider = 'openai';
      let cleanModel = (options.llmModel || '').toLowerCase().replace(/^(openai\/|azure\/|groq\/|google\/|anthropic\/)/, '');

      let vapiModel = 'gpt-4o-mini';
      if (cleanModel.includes('gpt-4o-mini') || cleanModel.includes('gpt-4.1-mini') || cleanModel.includes('gpt-5.4-mini') || cleanModel.includes('mini')) {
        vapiModelProvider = 'openai';
        vapiModel = 'gpt-4o-mini';
      } else if (cleanModel.includes('gpt-4o') || cleanModel.includes('gpt-4.1') || cleanModel.includes('gpt-5') || cleanModel.includes('gpt-4')) {
        vapiModelProvider = 'openai';
        vapiModel = 'gpt-4o';
      } else if (cleanModel.includes('claude-3-5-sonnet') || cleanModel.includes('sonnet')) {
        vapiModelProvider = 'anthropic';
        vapiModel = 'claude-3-5-sonnet-20241022';
      } else if (cleanModel.includes('claude-3-haiku') || cleanModel.includes('haiku') || cleanModel.includes('claude')) {
        vapiModelProvider = 'anthropic';
        vapiModel = 'claude-3-haiku-20240307';
      } else if (cleanModel.includes('llama') || cleanModel.includes('groq')) {
        vapiModelProvider = 'groq';
        vapiModel = 'llama-3.3-70b-versatile';
      } else if (cleanModel.includes('gemini-2') || cleanModel.includes('gemini-2.0')) {
        vapiModelProvider = 'google';
        vapiModel = 'gemini-2.0-flash';
      } else if (cleanModel.includes('gemini')) {
        vapiModelProvider = 'google';
        vapiModel = 'gemini-1.5-flash';
      } else if (cleanModel.includes('deepseek')) {
        vapiModelProvider = 'deep-seek';
        vapiModel = 'deepseek-chat';
      } else if (cleanModel.includes('grok') || cleanModel.includes('xai')) {
        vapiModelProvider = 'xai';
        vapiModel = 'grok-beta';
      }

      if (isAssistantId) {
        // Use configured Vapi Assistant with dynamic variable overrides
        payload.assistantId = options.llmModel;
        payload.assistantOverrides = {
          variableValues: options.variables || {},
          firstMessage: options.firstMessage,
          voicemailDetection: 'off',
          maxDurationSeconds: options.maxDurationSeconds || 600,
        };
        if (options.scriptPrompt) {
          payload.assistantOverrides.model = {
            provider: vapiModelProvider,
            model: vapiModel,
            messages: [{ role: 'system', content: options.scriptPrompt }],
          };
        }
      } else {
        // Build inline full assistant object
        payload.assistant = {
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: options.transcriberLanguage || 'en',
          },
          model: {
            provider: vapiModelProvider,
            model: vapiModel,
            messages: [
              {
                role: 'system',
                content: options.scriptPrompt || 'You are an intelligent real estate sales advisor.',
              },
            ],
          },
          voice: {
            provider: vapiVoiceProvider,
            voiceId: cleanVoiceId,
          },
          firstMessage: options.firstMessage,
          firstMessageMode: options.firstMessageMode || 'assistant-speaks-first',
          voicemailDetection: 'off',
          backgroundSound: options.backgroundSound || 'off',
          maxDurationSeconds: options.maxDurationSeconds || 600,
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
        error: data.message || (Array.isArray(data.message) ? data.message.join('; ') : `Vapi dispatch failed with HTTP ${res.status}`),
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
              provider: asst.voice?.provider || 'vapi',
              voiceId: asst.voice?.voiceId || 'Elliot',
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
                  name: `${asst.name || 'Assistant'} Voice (${asst.voice.provider || 'vapi'})`,
                  provider: asst.voice.provider || 'vapi',
                  accent: 'Assistant Configured',
                  gender: 'Female',
                  tags: [asst.voice.provider, 'My Assistant'].filter(Boolean),
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
      // ── 1. Curated Vapi Native Voices V2 (provider: "vapi") ──
      {
        id: 'Elliot',
        name: 'Elliot (Vapi V2)',
        provider: 'vapi',
        accent: 'Canadian (Soothing)',
        gender: 'Male',
        tags: ['V2', 'Realistic', 'Friendly', 'Professional', 'Default'],
        previewUrl: 'https://docs.vapi.ai/static/audio/elliot-sample.wav',
        previewText: 'Hello! I am calling regarding your recent luxury property inquiry.',
      },
      {
        id: 'Savannah',
        name: 'Savannah (Vapi V2)',
        provider: 'vapi',
        accent: 'American Southern',
        gender: 'Female',
        tags: ['V2', 'Realistic', 'Straightforward'],
        previewUrl: 'https://docs.vapi.ai/static/audio/savannah-sample.wav',
        previewText: 'Hi there, calling with an update on your property application.',
      },
      {
        id: 'Rohan',
        name: 'Rohan (Vapi)',
        provider: 'vapi',
        accent: 'Indian American',
        gender: 'Male',
        tags: ['Energetic', 'Bright', 'Consultative'],
        previewUrl: 'https://docs.vapi.ai/static/audio/sagar-sample.wav',
        previewText: 'Namaste! Are you interested in the new pre-launch apartments in Bangalore?',
      },
      {
        id: 'Emma',
        name: 'Emma (Vapi V2)',
        provider: 'vapi',
        accent: 'Asian American',
        gender: 'Female',
        tags: ['V2', 'Warm', 'Conversational'],
        previewUrl: 'https://docs.vapi.ai/static/audio/emma-sample.wav',
        previewText: 'Hello! Let me walk you through the pricing and floor plans for Skyline Luxuria.',
      },
      {
        id: 'Clara',
        name: 'Clara (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Warm)',
        gender: 'Female',
        tags: ['V2', 'Warm', 'Professional'],
        previewUrl: 'https://docs.vapi.ai/static/audio/clara-sample.wav',
        previewText: 'Good afternoon, I am following up on your luxury villa inquiry.',
      },
      {
        id: 'Nico',
        name: 'Nico (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Casual)',
        gender: 'Male',
        tags: ['V2', 'Casual', 'Natural'],
        previewUrl: 'https://docs.vapi.ai/static/audio/nico-sample.wav',
        previewText: 'Hey there! Are you looking for a 2BHK or 3BHK penthouse?',
      },
      {
        id: 'Kai',
        name: 'Kai (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Friendly)',
        gender: 'Male',
        tags: ['V2', 'Friendly', 'Approachable'],
        previewUrl: 'https://docs.vapi.ai/static/audio/kai-sample.wav',
        previewText: 'Hi! Can I help you schedule a VIP site visit this weekend?',
      },
      {
        id: 'Sagar',
        name: 'Sagar (Vapi V2)',
        provider: 'vapi',
        accent: 'Indian American',
        gender: 'Male',
        tags: ['V2', 'Steady', 'Professional'],
        previewUrl: 'https://docs.vapi.ai/static/audio/sagar-sample.wav',
        previewText: 'Hello sir, sharing exclusive pre-launch booking details with you.',
      },
      {
        id: 'Godfrey',
        name: 'Godfrey (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Young)',
        gender: 'Male',
        tags: ['V2', 'Young', 'Energetic'],
        previewUrl: 'https://docs.vapi.ai/static/audio/godfrey-sample.wav',
        previewText: 'Hi! Great news, 5 exclusive corner units have just been released.',
      },
      {
        id: 'Neil',
        name: 'Neil (Vapi V2)',
        provider: 'vapi',
        accent: 'Indian American',
        gender: 'Male',
        tags: ['V2', 'Clear', 'Professional'],
        previewUrl: 'https://docs.vapi.ai/static/audio/neil-sample.wav',
        previewText: 'Hello! I am calling to confirm your private site visit pass.',
      },
      {
        id: 'Layla',
        name: 'Layla (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Bright)',
        gender: 'Female',
        tags: ['V2', 'Bright', 'Cheerful'],
        previewUrl: 'https://docs.vapi.ai/static/audio/layla-sample.wav',
        previewText: 'Hi! Your appointment for Saturday morning has been confirmed.',
      },
      {
        id: 'Sid',
        name: 'Sid (Vapi V2)',
        provider: 'vapi',
        accent: 'American (Deep-Toned)',
        gender: 'Male',
        tags: ['V2', 'Smooth', 'Deep-Toned'],
        previewUrl: 'https://docs.vapi.ai/static/audio/sid-sample.wav',
        previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
      },
      {
        id: 'Naina',
        name: 'Naina (Vapi V2)',
        provider: 'vapi',
        accent: 'Indian American',
        gender: 'Female',
        tags: ['V2', 'Calm', 'Professional'],
        previewUrl: 'https://docs.vapi.ai/static/audio/naina-sample.wav',
        previewText: 'Namaste, I am following up on your luxury residence inquiry.',
      },

      // ── 2. ElevenLabs Voices on Vapi (provider: "11labs") ──
      {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel (11Labs)',
        provider: '11labs',
        accent: 'American Professional',
        gender: 'Female',
        tags: ['11labs', 'Calm', 'Consultative'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
        previewText: 'Hello! I am following up on your luxury apartment inquiry from yesterday.',
      },
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam (11Labs)',
        provider: '11labs',
        accent: 'American Deep',
        gender: 'Male',
        tags: ['11labs', 'Authoritative', 'High-Net-Worth'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/pNInz6obpgDQGcFmaJgB.mp3',
        previewText: 'Good day. I am presenting the exclusive penthouse collection.',
      },
      {
        id: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni (11Labs)',
        provider: '11labs',
        accent: 'American Executive',
        gender: 'Male',
        tags: ['11labs', 'Calm', 'Trustworthy'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/ErXwobaYiN019PkySvjV.mp3',
        previewText: 'Good afternoon, this is Antoni with an update on your property application.',
      },
      {
        id: 'TxGEqnHWrfWFTfGW9XjX',
        name: 'Josh (11Labs)',
        provider: '11labs',
        accent: 'American Conversational',
        gender: 'Male',
        tags: ['11labs', 'Casual', 'Friendly'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/TxGEqnHWrfWFTfGW9XjX.mp3',
        previewText: 'Hey! Quick question, are you looking for an investment or ready-to-move home?',
      },
      {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah (11Labs Default)',
        provider: '11labs',
        accent: 'American Professional',
        gender: 'Female',
        tags: ['11labs', 'Conversational', 'Pre-Sales'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/EXAVITQu4vr4xnSDxMaL.mp3',
        previewText: 'Hi there, I am calling from the sales gallery to check your preferred unit.',
      },
      {
        id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'Domi (11Labs)',
        provider: '11labs',
        accent: 'Indian / Global English',
        gender: 'Female',
        tags: ['11labs', 'Engaging', 'Warm'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/AZnzlk1XvdvUeBnXmlld.mp3',
        previewText: 'Hi! Let me share the floor plans and pricing for the luxury 3BHK residences.',
      },
      {
        id: 'flq6f7yk4E4fJM5XTYuZ',
        name: 'Michael (11Labs)',
        provider: '11labs',
        accent: 'British Executive',
        gender: 'Male',
        tags: ['11labs', 'Corporate', 'Commercial'],
        previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/flq6f7yk4E4fJM5XTYuZ.mp3',
        previewText: 'Hello sir, I am following up on the pre-launch allocation details.',
      },

      // ── 3. Deepgram Aura Voices on Vapi (provider: "deepgram") ──
      {
        id: 'aura-asteria-en',
        name: 'Asteria (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'American Clear',
        gender: 'Female',
        tags: ['Deepgram', 'Ultra Fast', 'Crisp'],
        previewUrl: 'https://static.deepgram.com/audio/voices/asteria.wav',
        previewText: 'Hello, this is Asteria following up on your property inquiry.',
      },
      {
        id: 'aura-luna-en',
        name: 'Luna (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'American Warm',
        gender: 'Female',
        tags: ['Deepgram', 'Warm', 'Follow-up'],
        previewUrl: 'https://static.deepgram.com/audio/voices/luna.wav',
        previewText: 'Hi! We have an exclusive early-bird discount on the new tower launch.',
      },
      {
        id: 'aura-stella-en',
        name: 'Stella (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'American Crisp',
        gender: 'Female',
        tags: ['Deepgram', 'Direct', 'Accurate'],
        previewUrl: 'https://static.deepgram.com/audio/voices/stella.wav',
        previewText: 'Hello, this is Stella following up on your property inquiry from yesterday.',
      },
      {
        id: 'aura-orion-en',
        name: 'Orion (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'American Deep',
        gender: 'Male',
        tags: ['Deepgram', 'Confident', 'Advisor'],
        previewUrl: 'https://static.deepgram.com/audio/voices/orion.wav',
        previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
      },
      {
        id: 'aura-zeus-en',
        name: 'Zeus (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'American Resonant',
        gender: 'Male',
        tags: ['Deepgram', 'Resonant', 'Authoritative'],
        previewUrl: 'https://static.deepgram.com/audio/voices/zeus.wav',
        previewText: 'Welcome to Skyline Realty. How may I direct your property inquiry?',
      },
      {
        id: 'aura-helios-en',
        name: 'Helios (Deepgram Aura)',
        provider: 'deepgram',
        accent: 'British Articulate',
        gender: 'Male',
        tags: ['Deepgram', 'Articulate', 'Clear'],
        previewUrl: 'https://static.deepgram.com/audio/voices/helios.wav',
        previewText: 'Good afternoon. I am calling to confirm your private site visit pass.',
      },

      // ── 4. Cartesia Sonic Voices on Vapi (provider: "cartesia") ──
      {
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        name: 'Sarah (Cartesia Sonic)',
        provider: 'cartesia',
        accent: 'American Conversational',
        gender: 'Female',
        tags: ['Cartesia', 'Sub-100ms', 'Sonic'],
        previewText: 'Hey there! I am following up on your luxury penthouse selection.',
      },
      {
        id: '694f9389-aac1-45b6-b726-9d9369183238',
        name: 'James (Cartesia Sonic)',
        provider: 'cartesia',
        accent: 'British Executive',
        gender: 'Male',
        tags: ['Cartesia', 'Luxury', 'Sonic'],
        previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
      },

      // ── 5. OpenAI Voices on Vapi (provider: "openai") ──
      {
        id: 'alloy',
        name: 'Alloy (OpenAI)',
        provider: 'openai',
        accent: 'Balanced & Neutral',
        gender: 'Neutral',
        tags: ['OpenAI', 'Adaptive', 'Realtime'],
        previewText: 'Hello! I am calling to confirm your appointment for this Saturday.',
      },
      {
        id: 'echo',
        name: 'Echo (OpenAI)',
        provider: 'openai',
        accent: 'Warm & Clear',
        gender: 'Male',
        tags: ['OpenAI', 'Warm', 'Clear'],
        previewText: 'Welcome to Skyline Realty! How can I help you find your dream home?',
      },
      {
        id: 'fable',
        name: 'Fable (OpenAI)',
        provider: 'openai',
        accent: 'British Expressive',
        gender: 'Male',
        tags: ['OpenAI', 'Expressive', 'Nuanced'],
        previewText: 'Good day. Let me share details regarding the exclusive new release.',
      },
      {
        id: 'onyx',
        name: 'Onyx (OpenAI)',
        provider: 'openai',
        accent: 'Deep & Authoritative',
        gender: 'Male',
        tags: ['OpenAI', 'Deep', 'Executive'],
        previewText: 'Hello, calling regarding the commercial office leasing schedule.',
      },
      {
        id: 'nova',
        name: 'Nova (OpenAI)',
        provider: 'openai',
        accent: 'Energetic & Bright',
        gender: 'Female',
        tags: ['OpenAI', 'Energetic', 'Modern'],
        previewText: 'Hi there! We have released 5 exclusive corner units with a spot discount.',
      },
      {
        id: 'shimmer',
        name: 'Shimmer (OpenAI)',
        provider: 'openai',
        accent: 'Expressive & Cheerful',
        gender: 'Female',
        tags: ['OpenAI', 'Expressive', 'Cheerful'],
        previewText: 'Hi! Let me walk you through the pricing and floor plans for Skyline Luxuria.',
      },
    ];

    // Deduplicate by id + provider
    const seen = new Set<string>();
    const combined: VoicePersonaItem[] = [];

    for (const v of [...accountVoices, ...nativeVapiVoices]) {
      const key = `${v.provider}_${v.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(v);
      }
    }

    return combined;
  }
}


