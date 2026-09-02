// ============================================================================
// BrokerOS — Sarvam AI Bulbul v3 TTS Audio Preview Synthesizer
// ============================================================================

export async function synthesizeSarvamAudio(
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

  const validSpeakers = [
    'shubh', 'aditya', 'ritu', 'priya', 'neha', 'rahul', 'pooja', 'rohan',
    'simran', 'kavya', 'amit', 'dev', 'ishita', 'shreya', 'ratan', 'varun',
    'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'ashutosh', 'advait',
    'anand', 'tanya', 'tarun', 'sunny', 'mani', 'gokul', 'vijay',
    'shruti', 'suhani', 'mohit', 'kavitha', 'rehan', 'soham', 'rupali',
  ];

  const cleanedId = (voiceId || '').toLowerCase().trim();
  const speaker = validSpeakers.includes(cleanedId) ? cleanedId : (cleanedId.includes('rahul') ? 'rahul' : 'priya');

  try {
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

    if (res.status === 200) {
      const data = (await res.json()) as any;
      const base64Audio = data.audios?.[0];
      if (base64Audio) {
        return {
          audioBuffer: Buffer.from(base64Audio, 'base64'),
          contentType: 'audio/mpeg',
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    audioBuffer: Buffer.from(text, 'utf-8'),
    contentType: 'audio/mpeg',
  };
}
