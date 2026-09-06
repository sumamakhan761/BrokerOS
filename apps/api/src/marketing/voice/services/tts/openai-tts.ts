// ============================================================================
// BrokerOS — OpenAI Cloud TTS Synthesizer
// ============================================================================

export async function synthesizeOpenAi(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const voiceIdLower = voiceId.toLowerCase();
  const validVoice = [
    'alloy',
    'echo',
    'fable',
    'onyx',
    'nova',
    'shimmer',
  ].includes(voiceIdLower)
    ? voiceIdLower
    : 'alloy';

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: validVoice,
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
