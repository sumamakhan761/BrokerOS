// ============================================================================
// BrokerOS — Retell AI Model Catalog & Remote Agent Loader
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const STANDARD_RETELL_MODELS: VoiceModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Retell Fast Engine)', provider: 'OpenAI', badge: 'Recommended', description: 'Lowest latency conversational turns with real-time interruptibility' },
  { id: 'gpt-4o', name: 'GPT-4o (Retell Full Reasoning)', provider: 'OpenAI', badge: 'High Intelligence', description: 'Advanced consultative sales, dynamic objection handling & objection recovery' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Retell Empathy)', provider: 'Anthropic', badge: 'Empathetic', description: 'Deep conversational empathy and sophisticated real estate advice' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'Ultra Fast', description: 'Cost-effective high speed prompt traversal' },
  { id: 'deepseek-v3', name: 'DeepSeek V3 (Retell Speed Engine)', provider: 'DeepSeek', badge: 'Fast / Cost-Effective', description: 'Optimized reasoning for qualification workflows' },
];

export async function fetchRetellAccountAgents(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.retellai.com/list-agents', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (Array.isArray(data)) {
        return data.map((a: any) => ({
          id: a.agent_id,
          name: a.agent_name || a.agent_id,
          voice: {
            voiceId: a.voice_id,
            model: a.voice_model,
            speed: a.voice_speed,
            emotion: a.voice_emotion,
            temperature: a.voice_temperature,
          },
          model: {
            model: a.response_engine?.llm_id || 'retell-llm',
            type: a.response_engine?.type || 'retell-llm',
          },
          language: a.language || 'en-US',
          ambientSound: a.ambient_sound,
          ambientSoundVolume: a.ambient_sound_volume,
          enableBackchannel: a.enable_backchannel,
          backchannelFrequency: a.backchannel_frequency,
          reminderTriggerMs: a.reminder_trigger_ms,
          reminderMaxCount: a.reminder_max_count,
          maxCallDurationMs: a.max_call_duration_ms,
          voicemailOption: a.voicemail_option,
          raw: a,
        }));
      }
    }
  } catch {
    // fallback
  }
  return [];
}
