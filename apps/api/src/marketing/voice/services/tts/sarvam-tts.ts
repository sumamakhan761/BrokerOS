// ============================================================================
// BrokerOS — Sarvam AI (Bulbul v3) Cloud TTS Synthesizer
// ============================================================================

import { SARVAM_SPEAKERS } from './tts-providers.constants.js';

export async function synthesizeSarvam(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const voiceIdLower = voiceId.toLowerCase();
  const speaker = SARVAM_SPEAKERS.includes(voiceIdLower)
    ? voiceIdLower
    : voiceIdLower.includes('rahul') || voiceIdLower.includes('shubh')
      ? 'rahul'
      : 'priya';

  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language_code: 'hi-IN',
      speaker,
      model: 'bulbul:v3',
      pace: 1.0,
      temperature: 0.6,
      speech_sample_rate: 24000,
      output_audio_codec: 'mp3',
    }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.audios?.[0]) {
      return {
        audioBuffer: Buffer.from(data.audios[0], 'base64'),
        contentType: 'audio/mpeg',
      };
    }
  }
  return null;
}
