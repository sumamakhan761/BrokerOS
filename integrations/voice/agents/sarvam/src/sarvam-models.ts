// ============================================================================
// BrokerOS — Sarvam AI Indic LLM & Speech Model Catalog
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const NATIVE_SARVAM_MODELS: VoiceModelItem[] = [
  {
    id: 'bulbul:v3',
    name: 'Bulbul v3 (Neural Speech Engine)',
    provider: 'Sarvam AI',
    badge: '30+ Voices',
    description: 'Latest Indic speech synthesis with expressive cadence across 11 languages',
  },
  {
    id: 'sarvam-2b',
    name: 'Sarvam 2B (Indic Conversational LLM)',
    provider: 'Sarvam AI',
    badge: '10 Indian Languages',
    description: 'Optimized for native Hindi, Hinglish, Tamil, Telugu, Marathi sales dialogues',
  },
  {
    id: 'saaras:v3',
    name: 'Saaras v3 (Indic Speech Recognition)',
    provider: 'Sarvam AI',
    badge: 'Accurate STT',
    description: 'Real-time multilingual Indian accent speech-to-text',
  },
  {
    id: 'sarvam-105b',
    name: 'Sarvam 105B (Indic Foundation LLM)',
    provider: 'Sarvam AI',
    badge: 'Enterprise Reasoning',
    description: 'Advanced multilingual foundation model for deep consultative conversations',
  },
];

export async function fetchSarvamModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return NATIVE_SARVAM_MODELS;

  try {
    const res = await fetch('https://api.sarvam.ai/v2/models', {
      headers: { 'api-subscription-key': apiKey },
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      const modelsList = data.data || [];
      if (Array.isArray(modelsList) && modelsList.length > 0) {
        const openSource = modelsList
          .filter((m: any) => !NATIVE_SARVAM_MODELS.some((nm) => nm.id === m.id))
          .map((m: any) => ({
            id: m.id,
            name: m.id.replace(/:/g, ' ').replace(/-/g, ' ').toUpperCase(),
            provider: 'Sarvam AI',
            badge: 'Open Source',
            description: `Sarvam AI ${m.id} model (hosted by ${m.owned_by || 'sarvam'})`,
          }));
        return [...NATIVE_SARVAM_MODELS, ...openSource];
      }
    }
  } catch {
    // fallback
  }

  return NATIVE_SARVAM_MODELS;
}
