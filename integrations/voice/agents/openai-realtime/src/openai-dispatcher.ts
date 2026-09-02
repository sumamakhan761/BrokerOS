// ============================================================================
// BrokerOS — OpenAI Speech Audio Synthesizer & Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function synthesizeOpenAiAudio(
  apiKey: string,
  text: string,
  voiceId: string,
): Promise<{ audioBuffer: Buffer; contentType: string }> {
  if (!apiKey) {
    return {
      audioBuffer: Buffer.from(text, 'utf-8'),
      contentType: 'audio/mpeg',
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceId || 'alloy',
      }),
    });

    if (res.status === 200) {
      const arrayBuf = await res.arrayBuffer();
      return {
        audioBuffer: Buffer.from(arrayBuf),
        contentType: 'audio/mpeg',
      };
    }
  } catch {
    // fallback
  }

  return {
    audioBuffer: Buffer.from(text, 'utf-8'),
    contentType: 'audio/mpeg',
  };
}
