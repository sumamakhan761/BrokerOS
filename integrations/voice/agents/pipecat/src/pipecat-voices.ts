// ============================================================================
// BrokerOS — Pipecat AI Pipeline Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const PIPECAT_VOICES: VoicePersonaItem[] = [
  {
    id: 'cartesia:a0e99841-438c-4a64-b679-ae501e7d6091',
    name: 'Sarah (Cartesia Sonic 3.5 on Pipecat)',
    provider: 'Pipecat Cartesia',
    accent: 'American Conversational',
    gender: 'Female',
    tags: ['Pipecat', 'Cartesia', 'Sub-100ms', 'Natural'],
    previewText: 'Hello! I am following up on your luxury penthouse selection at Signature Towers.',
  },
  {
    id: 'deepgram:aura-asteria-en',
    name: 'Asteria (Deepgram Aura on Pipecat)',
    provider: 'Pipecat Deepgram',
    accent: 'American Clear',
    gender: 'Female',
    tags: ['Pipecat', 'Deepgram', 'Aura', 'Crisp'],
    previewUrl: 'https://static.deepgram.com/audio/voices/asteria.wav',
    previewText: 'Hello, this is Asteria following up on your luxury property inquiry.',
  },
  {
    id: 'deepgram:aura-orion-en',
    name: 'Orion (Deepgram Aura on Pipecat)',
    provider: 'Pipecat Deepgram',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['Pipecat', 'Deepgram', 'Aura', 'Authoritative'],
    previewUrl: 'https://static.deepgram.com/audio/voices/orion.wav',
    previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
  },
  {
    id: 'elevenlabs:21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (ElevenLabs on Pipecat)',
    provider: 'Pipecat ElevenLabs',
    accent: 'American Warm Female',
    gender: 'Female',
    tags: ['Pipecat', 'ElevenLabs', 'Professional'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
    previewText: 'Hi, I am calling with an exclusive VIP invitation for Skyline Vista.',
  },
  {
    id: 'elevenlabs:iWNf11sz1GrUE4ppxTOL',
    name: 'Viraj (ElevenLabs Indic on Pipecat)',
    provider: 'Pipecat ElevenLabs',
    accent: 'Indian English / Hindi',
    gender: 'Male',
    tags: ['Pipecat', 'ElevenLabs', 'Indic', 'Energetic'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/iWNf11sz1GrUE4ppxTOL.mp3',
    previewText: 'Namaste! Main Skyline Realty team se call kar raha hoon.',
  },
];
