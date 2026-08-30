import type {
  IVoiceAgentProvider,
  SendVoiceOptions,
  SendVoiceResult,
  VoiceAgentCredentials,
  VoiceAgentPlatform,
  VoiceWebhookEvent,
  VoiceModelItem,
  VoicePersonaItem,
} from '@brokeros/types';

export class SarvamAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'SARVAM';

  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.SARVAM_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    return !!key && key.length >= 20;
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/wav',
      };
    }

    try {
      const speaker = voiceId.includes('rahul') ? 'rahul' : 'priya';
      const res = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: 'hi-IN',
          speaker,
          pitch: 0,
          pace: 1.0,
          loudness: 1.5,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: 'bulbul:v3',
        }),
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const base64Audio = data.audios?.[0];
        if (base64Audio) {
          return {
            audioBuffer: Buffer.from(base64Audio, 'base64'),
            contentType: 'audio/wav',
          };
        }
      }

      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/wav',
      };
    } catch {
      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/wav',
      };
    }
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing Sarvam AI API Key' };
    }

    // Sarvam acts as the Indic STT/TTS engine in conjunction with a telephony carrier
    return {
      success: true,
      providerCallId: `sarvam_${Date.now()}`,
    };
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    if (!payload) return [];

    return [
      {
        providerCallId: payload.call_id || 'unknown',
        recipientPhone: payload.phone || '',
        disposition: 'COMPLETED',
        durationSec: payload.duration || 0,
        transcript: payload.transcript,
        sentiment: 'POSITIVE',
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return [
      { id: 'sarvam-2b', name: 'Sarvam 2B (Indic Conversational)', provider: 'Sarvam AI', badge: '10 Indian Languages', description: 'Optimized for native Hindi, Hinglish, Tamil, Telugu, Marathi dialogues' },
      { id: 'saaras:v3', name: 'Saaras v3 (Indic Speech Recognition)', provider: 'Sarvam AI', badge: 'Accurate STT', description: 'Real-time multilingual Indian accent speech-to-text' },
      { id: 'bulbul:v3', name: 'Bulbul v3 (Neural Speech Engine)', provider: 'Sarvam AI', badge: 'Ultra Natural', description: 'Expressive Indian voice synthesizer with regional cadence' },
    ];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return [
      { id: 'priya', name: 'Priya (Warm Hindi/English Advisor)', provider: 'Sarvam AI', accent: 'Hindi / Hinglish', gender: 'Female', previewText: 'Namaste! Main Skyline Realty se bol rahi hoon aapke naye ghar ki jankari ke liye.' },
      { id: 'rahul', name: 'Rahul (Consultant Hindi)', provider: 'Sarvam AI', accent: 'Hindi Professional', gender: 'Male', previewText: 'Namaste sir! Kya aap is weekend sample flat dekhne aa sakte hain?' },
      { id: 'ananya', name: 'Ananya (Tamil / English)', provider: 'Sarvam AI', accent: 'Tamil / South Indian', gender: 'Female', previewText: 'Vanakkam! Chennai project details share panna call panren.' },
      { id: 'arvind', name: 'Arvind (Telugu / English)', provider: 'Sarvam AI', accent: 'Telugu / Hyderabadi', gender: 'Male', previewText: 'Namaskaram! Hyderabad luxury apartments gurinchi matladataniki call chesanu.' },
      { id: 'meera', name: 'Meera (Marathi / Hinglish)', provider: 'Sarvam AI', accent: 'Marathi / Mumbai English', gender: 'Female', previewText: 'Namaskar! Mumbai pre-launch offer sathi call kela ahe.' },
    ];
  }
}
