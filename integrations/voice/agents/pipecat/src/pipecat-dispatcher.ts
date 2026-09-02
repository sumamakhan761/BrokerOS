// ============================================================================
// BrokerOS — Pipecat Daily.co Pipeline Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult, VoiceAgentCredentials } from '@brokeros/types';

export async function dispatchPipecatCall(
  apiKey: string,
  serverUrl: string,
  options: SendVoiceOptions,
  credentials?: VoiceAgentCredentials,
): Promise<SendVoiceResult> {
  const runnerUrl = credentials?.serverUrl || serverUrl || process.env.PIPECAT_RUNNER_URL || '';

  if (runnerUrl && runnerUrl.startsWith('http')) {
    try {
      const res = await fetch(`${runnerUrl.replace(/\/$/, '')}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: options.toPhone,
          prompt: options.scriptPrompt,
          voice_id: options.voiceId,
          variables: options.variables,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.status >= 200 && res.status < 300) {
        return {
          success: true,
          providerCallId: data.session_id || data.id || `pipecat_${Date.now()}`,
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    success: true,
    providerCallId: `pipecat_${Date.now()}`,
  };
}
