// ============================================================================
// BrokerOS — Vapi AI Model Catalogs & Remote Assistant Loader
// ============================================================================

import type { VoiceAgentCredentials, VoiceModelItem } from '@brokeros/types';

export const STANDARD_VAPI_MODELS: VoiceModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Vapi Ultra Fast)', provider: 'OpenAI', badge: 'Recommended', description: 'Real-time conversational streaming with minimal latency (~100ms)' },
  { id: 'gpt-4o', name: 'GPT-4o (Vapi Full Reasoning)', provider: 'OpenAI', badge: 'High Intelligence', description: 'Advanced objection handling and complex pricing negotiations' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Super Smart', description: 'Deep conversational nuance for premium luxury real estate' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'Ultra Fast', description: 'Lightning-quick dialogue turns with cost-efficient inference' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq LPU)', provider: 'Groq', badge: 'Ultra Speed', description: 'Sub-50ms token generation for natural human-like cadence' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', badge: 'Multimodal', description: 'Fast responses with wide context window support' },
];

export async function fetchVapiAccountModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const assistants = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(assistants) && assistants.length > 0) {
        return assistants.map((asst: any) => ({
          id: asst.id,
          name: `${asst.name || 'Assistant'} (${asst.model?.model || asst.model?.provider || 'Vapi'})`,
          provider: (asst.model?.provider || 'Vapi').toUpperCase(),
          badge: 'My Vapi Assistant',
          description: `Configured Assistant on your Vapi Account: ${asst.name || asst.id}`,
        }));
      }
    }
  } catch {
    // fallback gracefully
  }
  return [];
}

export async function fetchVapiAccountAssistants(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${apiKey}` },
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
    // fallback
  }
  return [];
}
