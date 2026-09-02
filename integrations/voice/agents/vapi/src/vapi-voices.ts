// ============================================================================
// BrokerOS — Vapi AI Voice Personas & Provider Normalizers
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const NATIVE_VAPI_VOICES: VoicePersonaItem[] = [
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
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (11Labs on Vapi)',
    provider: '11labs',
    accent: 'American Professional',
    gender: 'Female',
    tags: ['11labs', 'Calm', 'Consultative'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/21m00Tcm4TlvDq8ikWAM.mp3',
    previewText: 'Hello! I am following up on your luxury apartment inquiry from yesterday.',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam (11Labs on Vapi)',
    provider: '11labs',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['11labs', 'Authoritative', 'High-Net-Worth'],
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/models/eleven_multilingual_v2/pNInz6obpgDQGcFmaJgB.mp3',
    previewText: 'Good day. I am presenting the exclusive penthouse collection.',
  },
  {
    id: 'aura-asteria-en',
    name: 'Asteria (Deepgram Aura on Vapi)',
    provider: 'deepgram',
    accent: 'American Clear',
    gender: 'Female',
    tags: ['Deepgram', 'Ultra Fast', 'Crisp'],
    previewUrl: 'https://static.deepgram.com/audio/voices/asteria.wav',
    previewText: 'Hello, this is Asteria following up on your property inquiry.',
  },
  {
    id: 'aura-orion-en',
    name: 'Orion (Deepgram Aura on Vapi)',
    provider: 'deepgram',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['Deepgram', 'Confident', 'Advisor'],
    previewUrl: 'https://static.deepgram.com/audio/voices/orion.wav',
    previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
  },
  {
    id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
    name: 'Sarah (Cartesia Sonic on Vapi)',
    provider: 'cartesia',
    accent: 'American Conversational',
    gender: 'Female',
    tags: ['Cartesia', 'Sub-100ms', 'Sonic'],
    previewText: 'Hey there! I am following up on your luxury penthouse selection.',
  },
];

export function normalizeVapiVoice(rawProvider: string, rawVoiceId: string): { provider: string; voiceId: string } {
  let vapiVoiceProvider: any = 'vapi';
  const rawVp = (rawProvider || '').toLowerCase();
  let cleanVoiceId = (rawVoiceId || 'Elliot').trim();

  // Detect provider prefix
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
  } else if (rawVp.includes('eleven') || rawVp === '11labs') {
    vapiVoiceProvider = '11labs';
  } else if (rawVp.includes('cartesia')) {
    vapiVoiceProvider = 'cartesia';
  } else if (rawVp.includes('deepgram')) {
    vapiVoiceProvider = 'deepgram';
  } else if (rawVp.includes('openai')) {
    vapiVoiceProvider = 'openai';
  }

  // Auto-detect 20-char ElevenLabs voice ID
  if (/^[a-zA-Z0-9]{20}$/.test(cleanVoiceId)) {
    vapiVoiceProvider = '11labs';
  }

  // Deepgram Aura normalizer
  if (vapiVoiceProvider === 'deepgram') {
    cleanVoiceId = cleanVoiceId.toLowerCase().replace(/^aura-/, '').replace(/-en$/, '').trim();
    const validDeepgramVoices = ['asteria', 'luna', 'stella', 'athena', 'orion', 'zeus', 'helios', 'apollo'];
    if (!validDeepgramVoices.includes(cleanVoiceId)) {
      const found = validDeepgramVoices.find((v) => cleanVoiceId.includes(v));
      cleanVoiceId = found || 'orion';
    }
  }

  // ElevenLabs normalizer map
  if (vapiVoiceProvider === '11labs') {
    const elevenMap: Record<string, string> = {
      rachel: '21m00Tcm4TlvDq8ikWAM',
      adam: 'pNInz6obpgDQGcFmaJgB',
      antoni: 'ErXwobaYiN019PkySvjV',
      josh: 'TxGEqnHWrfWFTfGW9XjX',
      sarah: 'EXAVITQu4vr4xnSDxMaL',
      domi: 'AZnzlk1XvdvUeBnXmlld',
      viraj: 'iWNf11sz1GrUE4ppxTOL',
    };
    if (elevenMap[cleanVoiceId.toLowerCase()]) {
      cleanVoiceId = elevenMap[cleanVoiceId.toLowerCase()];
    }
  }

  return { provider: vapiVoiceProvider, voiceId: cleanVoiceId };
}
