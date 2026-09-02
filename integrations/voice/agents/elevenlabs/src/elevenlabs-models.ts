// ============================================================================
// BrokerOS — ElevenLabs Conversational AI Models & Assistant Loader
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const STANDARD_ELEVENLABS_MODELS: VoiceModelItem[] = [
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', provider: 'ElevenLabs', badge: 'Ultra Realistic', description: 'Cross-language natural voice synthesis' },
  { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', provider: 'ElevenLabs', badge: 'Ultra Low Latency', description: 'Fastest conversational voice model (~75ms)' },
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', provider: 'ElevenLabs', badge: 'High Speed', description: 'Real-time conversational streaming' },
];

export async function fetchElevenLabsModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return STANDARD_ELEVENLABS_MODELS;
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          id: m.model_id,
          name: m.name || m.model_id,
          provider: 'ElevenLabs',
          badge: m.can_do_voice_conversion ? 'High Fidelity' : 'Standard',
          description: m.description || 'ElevenLabs Neural Speech Model',
        }));
      }
    }
  } catch {
    // fallback
  }
  return STANDARD_ELEVENLABS_MODELS;
}

export async function fetchElevenLabsAssistants(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const agentsList = Array.isArray(data) ? data : data.agents || [];
      return agentsList.map((a: any) => ({
        id: a.agent_id,
        name: a.name || a.agent_id,
        voice: {
          voiceId: a.conversation_config?.tts?.voice_id || '21m00Tcm4TlvDq8ikWAM',
          model: a.conversation_config?.tts?.model_id || 'eleven_flash_v2_5',
        },
        model: {
          model: a.conversation_config?.agent?.prompt?.llm || 'gpt-4o',
          systemPrompt: a.conversation_config?.agent?.prompt?.prompt || '',
        },
        firstMessage: a.conversation_config?.agent?.first_message || '',
        language: a.conversation_config?.agent?.language || 'en',
      }));
    }
  } catch {
    // fallback
  }
  return [];
}
