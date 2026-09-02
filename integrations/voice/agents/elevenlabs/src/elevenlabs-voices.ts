// ============================================================================
// BrokerOS — ElevenLabs Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const STANDARD_ELEVENLABS_VOICES: VoicePersonaItem[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Warm & Professional)', provider: 'ElevenLabs', accent: 'American Professional', gender: 'Female', previewText: 'Hi, I am calling with an exclusive VIP invitation for Skyline Vista.' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Calm & Energetic)', provider: 'ElevenLabs', accent: 'Indian / Global English', gender: 'Female', previewText: 'Hello! Let me share the floor plans and pricing for the luxury 3BHK residences.' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Persuasive Executive)', provider: 'ElevenLabs', accent: 'British Professional', gender: 'Female', previewText: 'Good day! I am reaching out regarding the pre-launch discount on DLF Privana.' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Executive Consultant)', provider: 'ElevenLabs', accent: 'American Corporate', gender: 'Male', previewText: 'Hello, this is your premier advisor for commercial inventory.' },
];

export async function fetchElevenLabsVoices(apiKey: string): Promise<VoicePersonaItem[]> {
  if (!apiKey) return STANDARD_ELEVENLABS_VOICES;
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.voices && Array.isArray(data.voices)) {
        return data.voices.map((v: any) => ({
          id: v.voice_id,
          name: v.name,
          provider: 'ElevenLabs',
          accent: v.labels?.accent || v.labels?.['accent / dialect'] || (v.labels?.gender ? `${v.labels.gender} Natural` : 'Global English'),
          gender: v.labels?.gender ? (v.labels.gender.toLowerCase() === 'male' ? 'Male' : 'Female') : 'Female',
          tags: [v.category, v.labels?.use_case, v.labels?.description].filter(Boolean),
          previewUrl: v.preview_url,
          previewText: `Hello! I am ${v.name}, sharing exclusive real estate opportunities with you.`,
        }));
      }
    }
  } catch {
    // fallback
  }
  return STANDARD_ELEVENLABS_VOICES;
}
