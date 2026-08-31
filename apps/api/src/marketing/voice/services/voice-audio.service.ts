import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { PreviewAudioTtsDto } from '../dto/voice.dto.js';
import type { VoiceAgentPlatform } from '@brokeros/types';

@Injectable()
export class VoiceAudioService {
  private readonly logger = new Logger(VoiceAudioService.name);
  private readonly prisma = prismaClient;

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
    }

    const providerLower = (dto.voiceProvider || '').toLowerCase().replace(/[\s-_]/g, '');
    const voiceIdLower = (dto.voiceId || '').toLowerCase().trim();

    const elevenVoiceMap: Record<string, string> = {
      rachel: '21m00Tcm4TlvDq8ikWAM',
      adam: 'pNInz6obpgDQGcFmaJgB',
      antoni: 'ErXwobaYiN019PkySvjV',
      josh: 'TxGEqnHWrfWFTfGW9XjX',
      sarah: 'EXAVITQu4vr4xnSDxMaL',
      domi: 'AZnzlk1XvdvUeBnXmlld',
      michael: 'flq6f7yk4E4fJM5XTYuZ',
      bella: 'EXAVITQu4vr4xnSDxMaL',
    };

    const sarvamSpeakers = [
      'shubh', 'aditya', 'ritu', 'priya', 'neha', 'rahul', 'pooja', 'rohan',
      'simran', 'kavya', 'amit', 'dev', 'ishita', 'shreya', 'ratan', 'varun',
      'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'ashutosh', 'advait',
      'anand', 'tanya', 'tarun', 'sunny', 'mani', 'gokul', 'vijay',
      'shruti', 'suhani', 'mohit', 'kavitha', 'rehan', 'soham', 'rupali',
      'ananya', 'arvind', 'meera'
    ];

    const isSarvam = providerLower.includes('sarvam') || platform === 'SARVAM' || sarvamSpeakers.includes(voiceIdLower);
    const isEleven = providerLower.includes('11labs') || providerLower.includes('eleven') || platform === 'ELEVENLABS' || !!elevenVoiceMap[voiceIdLower];
    const isOpenai = providerLower.includes('openai') || platform === 'OPENAI_REALTIME';
    const isDeepgram = providerLower.includes('deepgram') || voiceIdLower.startsWith('aura-');
    const isCartesia = providerLower.includes('cartesia') || platform === 'PIPECAT' || (dto.voiceId && dto.voiceId.includes('-') && dto.voiceId.length === 36);

    // 1. Check Sarvam AI Cloud TTS (Bulbul v3)
    let sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) {
      const sInt = await this.prisma.voiceAgentIntegration.findFirst({
        where: { platform: 'SARVAM', isActive: true },
      });
      if (sInt) sarvamKey = sInt.apiKey;
    }

    if (isSarvam && sarvamKey) {
      try {
        const speaker = sarvamSpeakers.includes(voiceIdLower)
          ? voiceIdLower
          : (voiceIdLower.includes('rahul') || voiceIdLower.includes('shubh') ? 'rahul' : 'priya');

        const res = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'api-subscription-key': sarvamKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: dto.text,
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
          const data = (await res.json()) as any;
          if (data.audios?.[0]) {
            return {
              audioBuffer: Buffer.from(data.audios[0], 'base64'),
              contentType: 'audio/mpeg',
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`Sarvam TTS call failed: ${err?.message}`);
      }
    }

    // 2. Check direct ElevenLabs Cloud TTS
    let elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey && platform === 'ELEVENLABS') elevenKey = apiKey;
    if (!elevenKey) {
      const eInt = await this.prisma.voiceAgentIntegration.findFirst({
        where: { platform: 'ELEVENLABS', isActive: true },
      });
      if (eInt) elevenKey = eInt.apiKey;
    }

    if (isEleven && elevenKey && dto.voiceId) {
      try {
        const resolvedElevenVoiceId = elevenVoiceMap[voiceIdLower] || dto.voiceId;
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedElevenVoiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: dto.text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          return {
            audioBuffer: Buffer.from(arrayBuf),
            contentType: 'audio/mpeg',
          };
        }
      } catch (err: any) {
        this.logger.warn(`ElevenLabs TTS call failed: ${err?.message}`);
      }
    }

    // 3. Check Deepgram Aura Cloud TTS
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (isDeepgram && deepgramKey) {
      try {
        const model = dto.voiceId.startsWith('aura-') ? dto.voiceId : `aura-${dto.voiceId}-en`;
        const res = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${deepgramKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: dto.text }),
        });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          return {
            audioBuffer: Buffer.from(arrayBuf),
            contentType: 'audio/mpeg',
          };
        }
      } catch (err: any) {
        this.logger.warn(`Deepgram TTS call failed: ${err?.message}`);
      }
    }

    // 4. Check Cartesia Cloud TTS (Sonic 3.5)
    const cartesiaKey = process.env.CARTESIA_API_KEY;
    if (isCartesia && cartesiaKey) {
      try {
        const res = await fetch('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'X-API-Key': cartesiaKey,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: 'sonic-english',
            transcript: dto.text,
            voice: { mode: 'id', id: dto.voiceId || 'a0e99841-438c-4a64-b679-ae501e7d6091' },
            output_format: { container: 'mp3', bit_rate: 128000, sample_rate: 44100 },
          }),
        });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          return {
            audioBuffer: Buffer.from(arrayBuf),
            contentType: 'audio/mpeg',
          };
        }
      } catch (err: any) {
        this.logger.warn(`Cartesia TTS call failed: ${err?.message}`);
      }
    }

    // 5. Check OpenAI Cloud TTS
    const openaiKey = process.env.OPENAI_API_KEY;
    if (isOpenai && openaiKey) {
      try {
        const validVoice = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voiceIdLower)
          ? voiceIdLower
          : 'alloy';

        const res = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: dto.text,
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
      } catch (err: any) {
        this.logger.warn(`OpenAI TTS call failed: ${err?.message}`);
      }
    }

    // 6. Dynamic Vapi Custom Prompt Persona Synthesis (via Deepgram Aura / Cartesia / ElevenLabs)
    const isMale = /elliot|nico|kai|sagar|godfrey|neil|sid|rohan|adam|antoni|josh|michael|orion|zeus|helios/i.test(dto.voiceId || '');
    if (deepgramKey) {
      try {
        const auraVoice = isMale ? 'aura-orion-en' : 'aura-asteria-en';
        const res = await fetch(`https://api.deepgram.com/v1/speak?model=${auraVoice}`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${deepgramKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: dto.text }),
        });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          return {
            audioBuffer: Buffer.from(arrayBuf),
            contentType: 'audio/mpeg',
          };
        }
      } catch {
        // Fallback gracefully
      }
    }

    // 7. Fallback to provider instance previewAudio
    const provider = getVoiceAgentProvider(platform, { apiKey });
    try {
      const result = await provider.previewAudio(dto.text, dto.voiceId, { apiKey });

      if (result.audioBuffer && result.audioBuffer.length > 500) {
        return result;
      }

      return {
        audioBuffer: Buffer.alloc(0),
        contentType: 'audio/mpeg',
      };
    } catch (err: any) {
      this.logger.warn(`TTS audio synthesis fallback triggered: ${err?.message}`);
      return {
        audioBuffer: Buffer.alloc(0),
        contentType: 'audio/mpeg',
      };
    }
  }
}
