// ============================================================================
// BrokerOS — Retell AI Outbound Phone Call Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function dispatchRetellOutboundCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  const isAgentId = options.llmModel?.startsWith('agent_') || options.voiceId?.startsWith('agent_');
  let targetAgentId = isAgentId ? (options.llmModel?.startsWith('agent_') ? options.llmModel : options.voiceId) : null;

  if (!targetAgentId) {
    try {
      const aRes = await fetch('https://api.retellai.com/list-agents', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (aRes.ok) {
        const agents = await aRes.json();
        if (Array.isArray(agents) && agents.length > 0) {
          targetAgentId = agents[0].agent_id;
        }
      }
    } catch {
      // fallback
    }
  }

  if (!targetAgentId) {
    return {
      success: false,
      error: 'No active Retell Agent found. Please create an agent in your Retell AI dashboard first.',
    };
  }

  const payload: any = {
    agent_id: targetAgentId,
    to_number: options.toPhone,
    from_number: options.fromNumber || '',
    retell_llm_dynamic_variables: {
      ...options.variables,
      system_prompt: options.scriptPrompt,
    },
  };

  if (options.ambientSound && options.ambientSound !== 'none') {
    payload.ambient_sound = options.ambientSound;
  }
  if (options.ambientSoundVolume !== undefined) {
    payload.ambient_sound_volume = options.ambientSoundVolume;
  }
  if (options.enableBackchannel !== undefined) {
    payload.enable_backchannel = options.enableBackchannel;
  }
  if (options.reminderTriggerMs !== undefined) {
    payload.reminder_trigger_ms = options.reminderTriggerMs;
  }

  try {
    const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.call_id || `retell_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: data.message || `Retell dispatch failed with HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch call via Retell AI',
    };
  }
}
