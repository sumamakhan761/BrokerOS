import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { PreviewAudioTtsDto } from '../dto/voice.dto.js';
import type { VoiceAgentPlatform } from '@brokeros/types';

@Injectable()
export class VoiceAudioService {
  private readonly logger = new Logger(VoiceAudioService.name);
  private readonly prisma = prismaClient;

  // Generates a valid RIFF WAV audio buffer with a pleasant audible synthesized melody/tone
  // as a deterministic fallback when third-party cloud API keys are in mock mode
  private generateSynthesizedWav(text: string): Buffer {
    const sampleRate = 24000;
    const durationSec = Math.min(3.5, Math.max(1.2, text.length * 0.05));
    const numSamples = Math.floor(sampleRate * durationSec);
    const dataSize = numSamples * 2; // 16-bit mono
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    buffer.writeUInt16LE(1, 22); // NumChannels (1 = mono)
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
    buffer.writeUInt16LE(2, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Generate smooth vocal chime harmonics
    const freq1 = 440; // A4
    const freq2 = 554.37; // C#5
    const freq3 = 659.25; // E5

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin((Math.PI * i) / numSamples); // smooth window
      const sample =
        envelope *
        (0.5 * Math.sin(2 * Math.PI * freq1 * t) +
          0.3 * Math.sin(2 * Math.PI * freq2 * t) +
          0.2 * Math.sin(2 * Math.PI * freq3 * t));

      const int16Sample = Math.max(-32768, Math.min(32767, Math.floor(sample * 24000)));
      buffer.writeInt16LE(int16Sample, 44 + i * 2);
    }

    return buffer;
  }

  async previewTtsAudio(dto: PreviewAudioTtsDto): Promise<{ audioBuffer: Buffer; contentType: string }> {
    let apiKey = '';
    let platform: VoiceAgentPlatform = 'VAPI';

    if (dto.agentPlatformId) {
      const integration = await this.prisma.voiceAgentIntegration.findUnique({
        where: { id: dto.agentPlatformId },
      });
      if (integration) {
        apiKey = integration.apiKey;
        platform = integration.platform as VoiceAgentPlatform;
      }
    } else if (dto.voiceProvider === 'sarvam') {
      platform = 'SARVAM';
    } else if (dto.voiceProvider === '11labs') {
      platform = 'ELEVENLABS';
    } else if (dto.voiceProvider === 'openai') {
      platform = 'OPENAI_REALTIME';
    }

    const provider = getVoiceAgentProvider(platform, { apiKey });

    try {
      const result = await provider.previewAudio(dto.text, dto.voiceId, { apiKey });

      // If the provider returned raw text or small fallback mock, generate playable WAV audio
      if (!result.audioBuffer || result.audioBuffer.length < 500) {
        const synthWav = this.generateSynthesizedWav(dto.text);
        return {
          audioBuffer: synthWav,
          contentType: 'audio/wav',
        };
      }

      return result;
    } catch (err: any) {
      this.logger.warn(`TTS audio synthesis fallback triggered: ${err?.message}`);
      const synthWav = this.generateSynthesizedWav(dto.text);
      return {
        audioBuffer: synthWav,
        contentType: 'audio/wav',
      };
    }
  }
}
