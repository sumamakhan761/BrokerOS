// ============================================================================
// BrokerOS — Cartesia Sonic Cloud TTS Synthesizer
// ============================================================================

import { CARTESIA_VOICE_MAP } from './tts-providers.constants.js';

export async function synthesizeCartesia(
  text: string,
  voiceId: string,
  apiKey: string,
  isMale: boolean,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const voiceIdLower = voiceId.toLowerCase();
  const resolvedCartesiaId =
    CARTESIA_VOICE_MAP[voiceIdLower] ||
    (voiceId.length === 36
      ? voiceId
      : isMale
        ? '694f9389-aac1-45b6-b726-9d9369183238'
        : 'a0e99841-438c-4a64-b679-ae501e7d6091');

  const res = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: 'sonic-3.5',
      transcript: text,
      voice: { mode: 'id', id: resolvedCartesiaId },
      output_format: {
        container: 'mp3',
        bit_rate: 128000,
        sample_rate: 44100,
      },
    }),
  });

  if (res.ok) {
    const arrayBuf = await res.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuf),
      contentType: 'audio/mpeg',
    };
  }
  return null;
}
