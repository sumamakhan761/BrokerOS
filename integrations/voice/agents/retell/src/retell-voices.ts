// ============================================================================
// BrokerOS — Retell AI Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const RETELL_VOICES: VoicePersonaItem[] = [
  {
    id: '11labs-rachel',
    name: 'Rachel (ElevenLabs via Retell)',
    provider: 'retell',
    accent: 'American Professional',
    gender: 'Female',
    tags: ['ElevenLabs', 'Warm', 'Default'],
    previewText: 'Hello! I am calling with an update on your luxury property inquiry.',
  },
  {
    id: '11labs-adam',
    name: 'Adam (ElevenLabs via Retell)',
    provider: 'retell',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['ElevenLabs', 'Authoritative', 'Executive'],
    previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
  },
  {
    id: '11labs-viraj',
    name: 'Viraj (ElevenLabs Indic via Retell)',
    provider: 'retell',
    accent: 'Indian English / Hindi',
    gender: 'Male',
    tags: ['ElevenLabs', 'Indic English', 'Warm'],
    previewText: 'Namaste! Main Skyline Realty team se call kar raha hoon.',
  },
  {
    id: 'deepgram-asteria',
    name: 'Asteria (Deepgram Aura via Retell)',
    provider: 'retell',
    accent: 'American Clear',
    gender: 'Female',
    tags: ['Deepgram', 'Ultra Fast', 'Crisp'],
    previewText: 'Hello, this is Asteria following up on your luxury real estate inquiry.',
  },
  {
    id: 'deepgram-orion',
    name: 'Orion (Deepgram Aura via Retell)',
    provider: 'retell',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['Deepgram', 'Corporate', 'Confident'],
    previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
  },
];
