// ============================================================================
// BrokerOS — ElevenLabs Cloud TTS Synthesizer
// ============================================================================

import { ELEVEN_VOICE_MAP } from './tts-providers.constants.js';

export async function synthesizeElevenLabs(
  text: string,
  voiceId: string,
  apiKey: string,
  isMale: boolean,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const voiceIdLower = voiceId.toLowerCase();
  const resolvedId =
    ELEVEN_VOICE_MAP[voiceIdLower] ||
    (voiceId.length > 15
      ? voiceId
      : isMale
        ? 'pNInz6obpgDQGcFmaJgB'
        : '21m00Tcm4TlvDq8ikWAM');

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
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
