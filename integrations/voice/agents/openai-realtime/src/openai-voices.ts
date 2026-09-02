// ============================================================================
// BrokerOS — OpenAI Realtime Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const OPENAI_VOICES: VoicePersonaItem[] = [
  { id: 'alloy', name: 'Alloy (Neutral & Balanced)', provider: 'OpenAI', accent: 'American Neutral', gender: 'Neutral', previewText: 'Hello! I am calling from Skyline Realty with an update on your luxury property inquiry.' },
  { id: 'echo', name: 'Echo (Warm & Conversational)', provider: 'OpenAI', accent: 'American Warm', gender: 'Male', previewText: 'Hi there! We have released exclusive pre-launch 3BHK residences.' },
  { id: 'shimmer', name: 'Shimmer (Expressive & Clear)', provider: 'OpenAI', accent: 'American Expressive', gender: 'Female', previewText: 'Good afternoon! Let me walk you through the payment plans for Signature Towers.' },
  { id: 'ash', name: 'Ash (Calm & Natural)', provider: 'OpenAI', accent: 'American Soft', gender: 'Male', previewText: 'Hello! I am following up on your luxury villa selection.' },
  { id: 'coral', name: 'Coral (Friendly & Energetic)', provider: 'OpenAI', accent: 'American Bright', gender: 'Female', previewText: 'Namaste! Are you interested in the new pre-launch apartments in Bangalore?' },
  { id: 'sage', name: 'Sage (Authoritative & Smooth)', provider: 'OpenAI', accent: 'American Corporate', gender: 'Female', previewText: 'Good day. Presenting the exclusive penthouse collection.' },
  { id: 'verse', name: 'Verse (Dynamic & Confident)', provider: 'OpenAI', accent: 'American Dynamic', gender: 'Male', previewText: 'Hey there! Are you looking for a 2BHK or 3BHK penthouse?' },
];
