// ============================================================================
// BrokerOS — LiveKit Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const LIVEKIT_VOICES: VoicePersonaItem[] = [
  // Cartesia on LiveKit
  {
    id: 'cartesia/sonic-3:a167e0f3-df7e-4d52-a9c3-f949145efdab',
    name: 'Blake (Cartesia Sonic 3)',
    provider: 'LiveKit Cartesia',
    accent: 'American Adult Male',
    gender: 'Male',
    tags: ['LiveKit', 'Cartesia', 'Sonic 3', 'Energetic'],
    previewText: 'Hi, this is Blake from Skyline Realty. Are you looking to schedule a site visit this weekend?',
  },
  {
    id: 'cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
    name: 'Jacqueline (Cartesia Sonic 3)',
    provider: 'LiveKit Cartesia',
    accent: 'American Adult Female',
    gender: 'Female',
    tags: ['LiveKit', 'Cartesia', 'Sonic 3', 'Confident'],
    previewText: 'Hello! I am following up on your luxury penthouse selection at Signature Towers.',
  },
  // Deepgram on LiveKit
  {
    id: 'deepgram/aura-2:apollo',
    name: 'Apollo (Deepgram Aura 2)',
    provider: 'LiveKit Deepgram',
    accent: 'American Casual Male',
    gender: 'Male',
    tags: ['LiveKit', 'Deepgram', 'Aura 2', 'Comfortable'],
    previewUrl: 'https://static.deepgram.com/audio/voices/apollo.wav',
    previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
  },
  {
    id: 'deepgram/aura-2:athena',
    name: 'Athena (Deepgram Aura 2)',
    provider: 'LiveKit Deepgram',
    accent: 'American Professional Female',
    gender: 'Female',
    tags: ['LiveKit', 'Deepgram', 'Aura 2', 'Smooth'],
    previewUrl: 'https://static.deepgram.com/audio/voices/athena.wav',
    previewText: 'Hello, this is Athena from Skyline Realty with exclusive pre-launch booking offers.',
  },
  // ElevenLabs on LiveKit
  {
    id: 'elevenlabs:iWNf11sz1GrUE4ppxTOL',
    name: 'Viraj (ElevenLabs Indic on LiveKit)',
    provider: 'LiveKit ElevenLabs',
    accent: 'Indian English / Hindi',
    gender: 'Male',
    tags: ['LiveKit', 'ElevenLabs', 'Indic', 'Energetic'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/iWNf11sz1GrUE4ppxTOL.mp3',
    previewText: 'Namaste! Main Skyline Realty team se call kar raha hoon.',
  },
  {
    id: 'elevenlabs:21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (ElevenLabs on LiveKit)',
    provider: 'LiveKit ElevenLabs',
    accent: 'American Warm Female',
    gender: 'Female',
    tags: ['LiveKit', 'ElevenLabs', 'Professional'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
    previewText: 'Hello! I am following up on your luxury apartment inquiry.',
  },
];
