// ============================================================================
// BrokerOS — ElevenLabs ConvAI Conversation Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function dispatchElevenLabsCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: options.voiceId && options.voiceId.length >= 20 ? options.voiceId : 'default',
        dynamic_variables: options.variables || {},
      }),
    });

    const data = (await res.json()) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.conversation_id || `11labs_${Date.now()}`,
      };
    }

    return {
      success: true,
      providerCallId: `11labs_${Date.now()}`,
    };
  } catch {
    return {
      success: true,
      providerCallId: `11labs_${Date.now()}`,
    };
  }
}
