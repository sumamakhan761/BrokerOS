// ============================================================================
// BrokerOS — Bolna AI Voice Personas & Dynamic Voice Loader
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const CURATED_BOLNA_VOICES: VoicePersonaItem[] = [
  // ElevenLabs on Bolna
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
  // Sarvam on Bolna
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
  // Cartesia on Bolna
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
    id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
    name: 'Sarah (Bolna Cartesia)',
    provider: 'bolna',
    accent: 'American Conversational',
    gender: 'Female',
    tags: ['Bolna AI', 'Cartesia', 'Sonic 3.5'],
    previewText: 'Hey there! I am following up on your luxury penthouse selection.',
  },
  // Deepgram on Bolna
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
];

export async function fetchBolnaDynamicVoices(apiKey: string): Promise<VoicePersonaItem[]> {
  if (!apiKey) return CURATED_BOLNA_VOICES;
  const dynamicVoices: VoicePersonaItem[] = [];

  try {
    const provRes = await fetch('https://api.bolna.ai/api/v1/voice-config/tts?language=hi', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (provRes.ok) {
      const provData = (await provRes.json()) as any;
      const providers = provData.providers || [];

      for (const p of providers) {
        if (!p.models || p.models.length === 0) continue;
        const model = p.models.find((m: any) => m.default) || p.models[0];
        try {
          const vRes = await fetch(
            `https://api.bolna.ai/api/v1/voice-config/tts/voices?provider_id=${p.id}&model_id=${model.id}&language=hi&page_size=20`,
            { headers: { Authorization: `Bearer ${apiKey}` } },
          );
          if (vRes.ok) {
            const vData = (await vRes.json()) as any;
            const items = vData.items || [];
            for (const item of items) {
              dynamicVoices.push({
                id: item.voice_id || item.id,
                name: `${item.name} (Bolna ${p.name})`,
                provider: 'bolna',
                accent: item.accent || 'Hindi / Indic',
                gender: item.gender === 'female' ? 'Female' : 'Male',
                tags: ['Bolna AI', p.name, model.display_name].filter(Boolean),
                previewUrl: item.preview_url,
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
    // fallback
  }

  // Deduplicate
  const seen = new Set<string>();
  const combined: VoicePersonaItem[] = [];
  for (const v of [...CURATED_BOLNA_VOICES, ...dynamicVoices]) {
    if (!seen.has(v.id)) {
      seen.add(v.id);
      combined.push(v);
    }
  }

  return combined;
}
