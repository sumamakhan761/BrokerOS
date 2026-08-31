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

    const rawVoiceId = (dto.voiceId || '').trim();
    const rawProvider = (dto.voiceProvider || '').toLowerCase().trim();

    // 1. Detect provider from prefix (e.g. 11labs-Adrian, deepgram-Angie, cartesia-Sarah, openai-Alloy, sarvam-Priya)
    let cleanVoiceId = rawVoiceId;
    let effectiveProvider = rawProvider;

    if (/^(11labs|elevenlabs|eleven)[-_]/i.test(rawVoiceId)) {
      effectiveProvider = '11labs';
      cleanVoiceId = rawVoiceId.replace(/^(11labs|elevenlabs|eleven)[-_]/i, '');
    } else if (/^deepgram[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'deepgram';
      cleanVoiceId = rawVoiceId.replace(/^deepgram[-_]/i, '');
    } else if (/^cartesia[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'cartesia';
      cleanVoiceId = rawVoiceId.replace(/^cartesia[-_]/i, '');
    } else if (/^openai[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'openai';
      cleanVoiceId = rawVoiceId.replace(/^openai[-_]/i, '');
    } else if (/^sarvam[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'sarvam';
      cleanVoiceId = rawVoiceId.replace(/^sarvam[-_]/i, '');
    }

    const voiceIdLower = cleanVoiceId.toLowerCase();
    const providerLower = effectiveProvider.replace(/[\s-_]/g, '');

    const elevenVoiceMap: Record<string, string> = {
      rachel: '21m00Tcm4TlvDq8ikWAM',
      adam: 'pNInz6obpgDQGcFmaJgB',
      antoni: 'ErXwobaYiN019PkySvjV',
      josh: 'TxGEqnHWrfWFTfGW9XjX',
      sarah: 'EXAVITQu4vr4xnSDxMaL',
      domi: 'AZnzlk1XvdvUeBnXmlld',
      michael: 'flq6f7yk4E4fJM5XTYuZ',
      bella: 'EXAVITQu4vr4xnSDxMaL',
      adrian: 'pNInz6obpgDQGcFmaJgB',
      jenny: '21m00Tcm4TlvDq8ikWAM',
      charlie: 'IKne3meq5aSn9XLyUdCD',
      george: 'JBFqnCBsd6RMkjVDRZzb',
      emily: 'LcfcDJNigL5wcJA5FgSe',
      nicole: 'piTKgcLEGmPE4e6mEKli',
      callum: 'N2lVS1w4EtoT3dr4eOWO',
      liam: 'TX3LPaxmHKxFdv7VOQHJ',
      will: 'bIHbv24MWmeRgasZH58o',
      brian: 'nPczCjzI2devNBz1zQrb',
      viraj: 'iWNf11sz1GrUE4ppxTOL',
    };

    const deepgramMap: Record<string, string> = {
      asteria: 'aura-asteria-en',
      angie: 'aura-asteria-en',
      luna: 'aura-luna-en',
      stella: 'aura-stella-en',
      athena: 'aura-asteria-en',
      hera: 'aura-luna-en',
      orion: 'aura-orion-en',
      zeus: 'aura-zeus-en',
      helios: 'aura-helios-en',
      orpheus: 'aura-orion-en',
      arcas: 'aura-zeus-en',
      perseus: 'aura-helios-en',
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
    const isDeepgram = providerLower.includes('deepgram') || voiceIdLower.startsWith('aura-') || !!deepgramMap[voiceIdLower];
    const isCartesia = providerLower.includes('cartesia') || platform === 'PIPECAT' || (cleanVoiceId.includes('-') && cleanVoiceId.length === 36);

    const isMale = /male|adrian|adam|antoni|josh|michael|george|callum|liam|will|brian|orion|zeus|helios|orpheus|arcas|perseus|james|elliot|nico|kai|sagar|godfrey|neil|sid|rohan|rahul|shubh|kabir|aditya|varun|manan|sumit/i.test(cleanVoiceId);

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

    if (isEleven && elevenKey) {
      try {
        const resolvedElevenVoiceId = elevenVoiceMap[voiceIdLower] || (cleanVoiceId.length > 15 ? cleanVoiceId : (isMale ? 'pNInz6obpgDQGcFmaJgB' : '21m00Tcm4TlvDq8ikWAM'));
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
        const model = deepgramMap[voiceIdLower] || (voiceIdLower.startsWith('aura-') ? voiceIdLower : `aura-${voiceIdLower}-en`);
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
        const cartesiaVoiceMap: Record<string, string> = {
          sarah: 'a0e99841-438c-4a64-b679-ae501e7d6091',
          james: '694f9389-aac1-45b6-b726-9d9369183238',
          katie: 'f114a467-c40a-4db8-964d-aaba01609c68',
          brooke: 'e90c6678-f0d3-4767-970c-26b69b4c32ea',
          cali: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        };

        const resolvedCartesiaId = cartesiaVoiceMap[voiceIdLower] || (cleanVoiceId.length === 36 ? cleanVoiceId : (isMale ? '694f9389-aac1-45b6-b726-9d9369183238' : 'a0e99841-438c-4a64-b679-ae501e7d6091'));

        const res = await fetch('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'X-API-Key': cartesiaKey,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: 'sonic-3.5',
            transcript: dto.text,
            voice: { mode: 'id', id: resolvedCartesiaId },
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

    // 6. Check MiniMax Cloud TTS (speech-01-turbo)
    const minimaxKey = process.env.MINIMAX_API_KEY;
    const isMinimax = providerLower.includes('minimax') || rawVoiceId.toLowerCase().startsWith('minimax');
    if (isMinimax && minimaxKey) {
      try {
        const res = await fetch('https://api.minimaxi.chat/v1/t2a_v2', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${minimaxKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'speech-01-turbo',
            text: dto.text,
            voice_setting: {
              voice_id: cleanVoiceId || (isMale ? 'male-qn-qingse' : 'female-shaonv'),
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
          const data = (await res.json()) as any;
          if (data.data?.audio) {
            return {
              audioBuffer: Buffer.from(data.data.audio, 'hex'),
              contentType: 'audio/mpeg',
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`MiniMax TTS call failed: ${err?.message}`);
      }
    }

    // 7. Check Fish Audio Cloud TTS
    const fishKey = process.env.FISH_AUDIO_API_KEY;
    const isFishAudio = providerLower.includes('fish') || rawVoiceId.toLowerCase().startsWith('fishaudio');
    if (isFishAudio && fishKey) {
      try {
        const res = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${fishKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: dto.text,
            reference_id: cleanVoiceId.length > 20 ? cleanVoiceId : undefined,
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
      } catch (err: any) {
        this.logger.warn(`Fish Audio TTS call failed: ${err?.message}`);
      }
    }

    // 8. Universal High-Fidelity Persona Synthesis Fallback (For Inworld, Minimax fallback, Fish Audio fallback, Vapi custom turns)
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

    if (elevenKey) {
      try {
        const elevenFallback = isMale ? 'pNInz6obpgDQGcFmaJgB' : '21m00Tcm4TlvDq8ikWAM';
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenFallback}`, {
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
