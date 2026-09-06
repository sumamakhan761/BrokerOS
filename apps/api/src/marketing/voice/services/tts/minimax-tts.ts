// ============================================================================
// BrokerOS — MiniMax & Fish Audio Cloud TTS Synthesizers
// ============================================================================

export async function synthesizeMiniMax(
  text: string,
  voiceId: string,
  apiKey: string,
  isMale: boolean,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const res = await fetch('https://api.minimaxi.chat/v1/t2a_v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'speech-01-turbo',
      text,
      voice_setting: {
        voice_id: voiceId || (isMale ? 'male-qn-qingse' : 'female-shaonv'),
        speed: 1.0,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1,
      },
    }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.data?.audio) {
      return {
        audioBuffer: Buffer.from(data.data.audio, 'hex'),
        contentType: 'audio/mpeg',
      };
    }
  }
  return null;
}

export async function synthesizeFishAudio(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      reference_id: voiceId.length > 20 ? voiceId : undefined,
      format: 'mp3',
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
