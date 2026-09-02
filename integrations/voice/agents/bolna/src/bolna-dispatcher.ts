// ============================================================================
// BrokerOS — Bolna AI Call Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function dispatchBolnaOutboundCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  const isAgentUUID = (id?: string) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let agentId = isAgentUUID(options.llmModel) ? options.llmModel : (isAgentUUID(options.voiceId) ? options.voiceId : null);

  if (!agentId) {
    try {
      const aRes = await fetch('https://api.bolna.ai/agent/all', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (aRes.ok) {
        const data = await aRes.json();
        const list = Array.isArray(data) ? data : data?.items || [];
        if (list.length > 0) {
          agentId = list[0].id || list[0].agent_id;
        }
      }
    } catch {
      // fallback
    }
  }

  agentId = agentId || '';

  const callPayload: any = {
    agent_id: agentId,
    recipient_phone_number: options.toPhone,
    user_data: {
      ...options.variables,
      prompt: options.scriptPrompt,
    },
  };

  if (options.fromNumber) {
    callPayload.from_phone_number = options.fromNumber;
  }

  try {
    const res = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callPayload),
    });

    const data = (await res.json()) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.call_id || data.execution_id || `bolna_${Date.now()}`,
      };
    }

    const errMsg = data.message || data.detail || `Bolna dispatch failed with HTTP ${res.status}`;
    if (typeof errMsg === 'string' && errMsg.includes('Trial accounts can only make calls to verified')) {
      return {
        success: false,
        error: 'Bolna trial account restriction: Calls can only be placed to verified numbers in your Bolna dashboard.',
      };
    }

    return {
      success: false,
      error: errMsg,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch call via Bolna AI',
    };
  }
}
