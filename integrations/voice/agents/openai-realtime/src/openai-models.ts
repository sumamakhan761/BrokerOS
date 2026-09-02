// ============================================================================
// BrokerOS — OpenAI Realtime Speech Model Catalog
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const OPENAI_MODELS: VoiceModelItem[] = [
  { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview', provider: 'OpenAI', badge: 'State of the Art', description: 'Speech-to-speech multimodal reasoning with emotional inflection & interruptions' },
  { id: 'gpt-4o-mini-realtime-preview', name: 'GPT-4o Mini Realtime', provider: 'OpenAI', badge: 'Cost Efficient', description: 'Fast, lightweight realtime conversational speech' },
];

export async function fetchOpenAiModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return OPENAI_MODELS;
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.data && Array.isArray(data.data)) {
        const realtimeAndAudio = data.data.filter((m: any) =>
          m.id.includes('realtime') ||
          m.id.includes('audio') ||
          m.id === 'gpt-4o' ||
          m.id === 'gpt-4o-mini'
        );

        if (realtimeAndAudio.length > 0) {
          return realtimeAndAudio.map((m: any) => ({
            id: m.id,
            name: m.id.replace(/-/g, ' ').toUpperCase(),
            provider: 'OpenAI',
            badge: m.id.includes('realtime') ? 'Speech-to-Speech' : 'Standard',
            description: `Live OpenAI Model (${m.id})`,
          }));
        }
      }
    }
  } catch {
    // fallback
  }
  return OPENAI_MODELS;
}
