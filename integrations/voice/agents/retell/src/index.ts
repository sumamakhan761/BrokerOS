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
      const res = await fetch('https://api.retellai.com/list-agents', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      return res.status === 200;
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

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return [];

    try {
      const res = await fetch('https://api.retellai.com/list-agents', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (Array.isArray(data)) {
          return data.map((a: any) => ({
            id: a.agent_id,
            name: a.agent_name || a.agent_id,
            voice: {
              voiceId: a.voice_id,
              model: a.voice_model,
              speed: a.voice_speed,
              emotion: a.voice_emotion,
              temperature: a.voice_temperature,
            },
            model: {
              model: a.response_engine?.llm_id || 'retell-llm',
              type: a.response_engine?.type || 'retell-llm',
            },
            language: a.language || 'en-US',
            ambientSound: a.ambient_sound,
            ambientSoundVolume: a.ambient_sound_volume,
            enableBackchannel: a.enable_backchannel,
            backchannelFrequency: a.backchannel_frequency,
            reminderTriggerMs: a.reminder_trigger_ms,
            reminderMaxCount: a.reminder_max_count,
            maxCallDurationMs: a.max_call_duration_ms,
            voicemailOption: a.voicemail_option,
            raw: a,
          }));
        }
      }
    } catch {
      // Graceful fallback
    }

    return [];
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
      const isAgentId =
        options.llmModel?.startsWith('agent_') ||
        options.voiceId?.startsWith('agent_');

      let targetAgentId = isAgentId
        ? (options.llmModel?.startsWith('agent_') ? options.llmModel : options.voiceId)
        : null;

      // 1. Auto-discover active Retell Agent if not explicitly passed
      if (!targetAgentId) {
        try {
          const aRes = await fetch('https://api.retellai.com/list-agents', {
            headers: { Authorization: `Bearer ${key}` },
          });
          if (aRes.ok) {
            const agents = await aRes.json();
            if (Array.isArray(agents) && agents.length > 0) {
              targetAgentId = agents[0].agent_id;
            }
          }
        } catch {
          // fallback
        }
      }

      if (!targetAgentId) {
        return {
          success: false,
          error: 'No active Retell Agent found. Please create an agent in your Retell AI dashboard first.',
        };
      }

      // 1. If Vobiz carrier is selected, dispatch outbound PSTN call directly via Vobiz line
      if (options.telephonyCredentials?.apiKey && options.telephonyCredentials?.apiToken && !options.telephonyCredentials?.subdomain && !options.telephonyCredentials?.accountSid) {
        const id = options.telephonyCredentials.apiKey;
        const token = options.telephonyCredentials.apiToken;
        const cleanTo = options.toPhone.replace(/[^\d+]/g, '');
        const cleanFrom = (options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '').replace(/[^\d+]/g, '');
        const message = options.firstMessage || 'Hello! Thank you for connecting with us.';

        try {
          const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
          const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=RETELL`;

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
              providerCallId: data.callId || data.call_uuid || `vobiz_retell_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Retell REST API
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
              providerCallId: data?.Call?.Sid || data?.sid || `exotel_retell_${Date.now()}`,
            };
          }
        } catch {
          // fallback to Retell REST API
        }
      }

      // 3. Resolve or auto-import phone number in Retell
      let fromNumber = options.fromNumber;
      try {
        const numRes = await fetch('https://api.retellai.com/list-phone-numbers', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (numRes.ok) {
          const numbers = await numRes.json();
          if (Array.isArray(numbers) && numbers.length > 0) {
            const matched = numbers.find((n: any) => n.phone_number === fromNumber || n.phone_number_pretty === fromNumber);
            if (matched) {
              fromNumber = matched.phone_number;
            } else {
              fromNumber = numbers[0].phone_number;
            }
          }
        }
      } catch {
        // fallback to original
      }

      if (!fromNumber) {
        return {
          success: false,
          error: 'No phone number registered in your Retell AI account. Please select Twilio in Step 3 or add a number in Retell.',
        };
      }

      const payload: any = {
        from_number: fromNumber,
        to_number: options.toPhone,
        override_agent_id: targetAgentId,
        retell_llm_dynamic_variables: {
          ...options.variables,
          customer_name: options.variables?.firstName || options.variables?.fullName || 'Valued Client',
          script_prompt: options.scriptPrompt,
          first_message: options.firstMessage || 'Hello! Calling from Skyline Realty regarding your luxury property inquiry.',
        },
      };

      const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
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
          providerCallId: data.call_id || `retell_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: data.message || `Retell dispatch failed with HTTP ${res.status}: ${JSON.stringify(data)}`,
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
    const standardModels: VoiceModelItem[] = [
      { id: 'gpt-4o', name: 'GPT-4o (Retell Ultra Intelligent)', provider: 'OpenAI', badge: 'Recommended', description: 'Real-time complex sales negotiation and objection handling' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Retell Fast)', provider: 'OpenAI', badge: 'Ultra Fast', description: 'Low latency real-time conversation (~110ms)' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'High Nuance', description: 'Top-tier natural cadence and emotional reasoning' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'Speed Leader', description: 'Blazing fast responses with multilingual depth' },
    ];

    if (key) {
      try {
        const res = await fetch('https://api.retellai.com/v2/list-retell-llms', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          const llmList = Array.isArray(data) ? data : data?.items || [];
          if (llmList.length > 0) {
            const dynamicLlms: VoiceModelItem[] = llmList.map((llm: any) => ({
              id: llm.llm_id || llm.id,
              name: `Custom LLM: ${llm.model || 'gpt-4o'} (${(llm.general_prompt || '').slice(0, 24)}...)`,
              provider: 'Retell Account LLM',
              badge: 'Configured LLM',
              description: `Retell Custom LLM (${llm.model || 'gpt-4o'})`,
            }));
            return [...dynamicLlms, ...standardModels];
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    return standardModels;
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
          if (Array.isArray(data) && data.length > 0) {
            return data.map((v: any) => ({
              id: v.voice_id,
              name: v.voice_name || v.voice_id,
              provider: v.provider || 'Retell',
              accent: v.accent || 'Global English',
              gender: v.gender || 'Female',
              tags: [v.provider, v.accent, v.gender, v.age].filter(Boolean),
              previewUrl: v.preview_audio_url,
              previewText: 'Hello! I am delighted to speak with you regarding our exclusive luxury real estate opportunities.',
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    return [
      { id: 'cartesia-Cleo', name: 'Cleo (Warm Executive)', provider: 'Cartesia', accent: 'American', gender: 'Female', previewText: 'Hello! I am calling to confirm your site visit for this weekend.' },
      { id: '11labs-Adrian', name: 'Adrian (Energetic Sales)', provider: 'ElevenLabs', accent: 'American Professional', gender: 'Male', previewText: 'Hi, this is Adrian with Skyline Realty regarding your project inquiry.' },
      { id: 'deepgram-Asteria', name: 'Asteria (Ultra Fast)', provider: 'Deepgram', accent: 'Neutral Professional', gender: 'Female', previewText: 'Good day! Would you like to review the updated payment plan?' },
    ];
  }
}


