// ============================================================================
// BrokerOS — Voice Audio Transcoder: μ-law (G.711u) <-> Linear PCM 16-bit
// Optimized for Telephony (Twilio / Vobiz / Telnyx / Exotel) <-> AI Voice Engines
// ============================================================================

export class VoiceAudioTranscoder {
  private static readonly ULAW_BIAS = 0x84;
  private static readonly ULAW_CLIP = 32635;

  /**
   * Decode 8-bit G.711 μ-law buffer into 16-bit Linear PCM buffer (8kHz)
   */
  static ulawToPcm16(ulawBuffer: Buffer): Buffer {
    const pcmBuffer = Buffer.alloc(ulawBuffer.length * 2);
    for (let i = 0; i < ulawBuffer.length; i++) {
      const pcmSample = this.ulawSampleToLinear(ulawBuffer[i]);
      pcmBuffer.writeInt16LE(pcmSample, i * 2);
    }
    return pcmBuffer;
  }

  /**
   * Encode 16-bit Linear PCM buffer (8kHz) into 8-bit G.711 μ-law buffer
   */
  static pcm16ToUlaw(pcmBuffer: Buffer): Buffer {
    const sampleCount = Math.floor(pcmBuffer.length / 2);
    const ulawBuffer = Buffer.alloc(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const sample = pcmBuffer.readInt16LE(i * 2);
      ulawBuffer[i] = this.linearSampleToUlaw(sample);
    }
    return ulawBuffer;
  }

  /**
   * Base64 μ-law string from carrier -> 16-bit Linear PCM Buffer for AI STT
   */
  static base64UlawToPcm16(base64Payload: string): Buffer {
    const rawUlaw = Buffer.from(base64Payload, 'base64');
    return this.ulawToPcm16(rawUlaw);
  }

  /**
   * 16-bit Linear PCM Buffer from AI TTS -> Base64 μ-law string for carrier
   */
  static pcm16ToBase64Ulaw(pcmBuffer: Buffer): string {
    const ulaw = this.pcm16ToUlaw(pcmBuffer);
    return ulaw.toString('base64');
  }

  private static ulawSampleToLinear(ulawByte: number): number {
    const complement = ~ulawByte;
    const sign = complement & 0x80;
    const exponent = (complement >> 4) & 0x07;
    const mantissa = complement & 0x0f;

    let sample = ((mantissa << 3) + this.ULAW_BIAS) << exponent;
    sample -= this.ULAW_BIAS;
    return sign !== 0 ? -sample : sample;
  }

  private static linearSampleToUlaw(sample: number): number {
    let sign = 0;
    if (sample < 0) {
      sign = 0x80;
      sample = -sample;
    }
    if (sample > this.ULAW_CLIP) sample = this.ULAW_CLIP;
    sample += this.ULAW_BIAS;

    let exponent = 7;
    for (
      let expMask = 0x4000;
      (sample & expMask) === 0 && exponent > 0;
      expMask >>= 1
    ) {
      exponent--;
    }

    const mantissa = (sample >> (exponent + 3)) & 0x0f;
    const ulawByte = ~(sign | (exponent << 4) | mantissa) & 0xff;
    return ulawByte;
  }
}
