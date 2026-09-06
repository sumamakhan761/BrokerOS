// ============================================================================
// BrokerOS — Deepgram Aura Cloud TTS Synthesizer
// ============================================================================

import { DEEPGRAM_MAP } from './tts-providers.constants.js';

export async function synthesizeDeepgram(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const voiceIdLower = voiceId.toLowerCase();
  const model =
    DEEPGRAM_MAP[voiceIdLower] ||
    (voiceIdLower.startsWith('aura-')
      ? voiceIdLower
      : `aura-${voiceIdLower}-en`);

  const res = await fetch(
    `https://api.deepgram.com/v1/speak?model=${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    },
  );

  if (res.ok) {
    const arrayBuf = await res.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuf),
      contentType: 'audio/mpeg',
    };
  }
  return null;
}
