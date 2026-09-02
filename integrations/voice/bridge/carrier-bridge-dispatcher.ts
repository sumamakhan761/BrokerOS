// ============================================================================
// BrokerOS — Centralized Telephony Carrier Bridge Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult, VoiceAgentPlatform } from '@brokeros/types';

export interface CarrierBridgeResult {
  handled: boolean;
  result?: SendVoiceResult;
}

/**
 * Checks if carrier credentials (Vobiz, Exotel, Twilio) are present in SendVoiceOptions
 * and dispatches the call directly through the selected carrier's PSTN trunking line.
 */
export async function tryCarrierBridgeDispatch(
  platform: VoiceAgentPlatform,
  options: SendVoiceOptions,
): Promise<CarrierBridgeResult> {
  const telCreds = options.telephonyCredentials;
  if (!telCreds) {
    return { handled: false };
  }

  const message = options.firstMessage || 'Hello! Thank you for connecting with us.';
  const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');

  // ── 1. VOBIZ PSTN Carrier Bridge ──
  if (telCreds.apiKey && telCreds.apiToken && !telCreds.subdomain && !telCreds.accountSid) {
    const id = telCreds.apiKey;
    const token = telCreds.apiToken;
    const cleanTo = options.toPhone.replace(/[^\d+]/g, '');
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d+]/g, '');
    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=${platform}&voice=${encodeURIComponent(options.voiceId || '')}`;

    try {
      const res = await fetch(`https://api.vobiz.ai/api/v1/Account/${id}/Call/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-ID': id,
          'X-Auth-Token': token,
          Authorization: `Basic ${Buffer.from(`${id}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify({
          to: cleanTo,
          from: cleanFrom,
          answer_url: answerUrl,
          answer_method: 'GET',
        }),
      });

      if (res.status >= 200 && res.status < 300) {
        const data = (await res.json().catch(() => ({}))) as any;
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.callId || data.call_uuid || `vobiz_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      }
    } catch {
      // fallback to native agent API
    }
  }

  // ── 2. EXOTEL PSTN Carrier Bridge ──
  if (telCreds.apiKey && telCreds.apiToken && telCreds.accountSid && telCreds.subdomain) {
    const k = telCreds.apiKey;
    const tok = telCreds.apiToken;
    const sid = telCreds.accountSid;
    const domain = telCreds.subdomain;
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d]/g, '');
    let cleanTo = options.toPhone.replace(/[^\d]/g, '');
    if (cleanTo.startsWith('91') && cleanTo.length === 12) cleanTo = '0' + cleanTo.slice(2);
    else if (cleanTo.length === 10) cleanTo = '0' + cleanTo;

    try {
      const authHeader = Buffer.from(`${k}:${tok}`).toString('base64');
      const body = new URLSearchParams({
        From: cleanTo,
        To: cleanFrom,
        CallerId: cleanFrom,
        CallType: 'trans',
        TimeLimit: '60',
        TimeOut: '30',
      });

      const res = await fetch(`https://${domain}/v1/Accounts/${sid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (res.status >= 200 && res.status < 300) {
        const data = (await res.json().catch(() => ({}))) as any;
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data?.Call?.Sid || data?.sid || `exotel_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      }
    } catch {
      // fallback to native agent API
    }
  }

  // ── 3. TWILIO PSTN Carrier Bridge (Webhook Streaming Agents) ──
  if (
    telCreds.accountSid &&
    telCreds.authToken &&
    (platform === 'SARVAM' || platform === 'OPENAI_REALTIME' || platform === 'ELEVENLABS')
  ) {
    try {
      const sid = telCreds.accountSid;
      const token = telCreds.authToken;
      const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');
      const twilioUrl = `${publicUrl}/api/marketing/voice/webhooks/twilio-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=${platform}&voice=${encodeURIComponent(options.voiceId || '')}`;

      const body = new URLSearchParams({
        To: options.toPhone,
        From: options.fromNumber || telCreds.fromNumbers?.[0] || '',
        Url: twilioUrl,
        Method: 'POST',
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (res.status >= 200 && res.status < 300) {
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.sid || `twilio_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      }
    } catch {
      // fallback
    }
  }

  // ── 4. TELNYX PSTN Carrier Bridge ──
  if (telCreds.apiKey && (telCreds.apiKey.startsWith('KEY') || (!telCreds.apiToken && !telCreds.authToken && !telCreds.accountSid))) {
    const key = telCreds.apiKey;
    const cleanTo = options.toPhone.startsWith('+') ? options.toPhone : `+${options.toPhone.replace(/[^\d]/g, '')}`;
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').startsWith('+')
      ? options.fromNumber || telCreds.fromNumbers?.[0]
      : `+${(options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d]/g, '')}`;

    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/telnyx-answer?campaignId=${options.campaignId || 'direct_test'}&firstMessage=${encodeURIComponent(message)}&scriptPrompt=${encodeURIComponent(options.scriptPrompt || '')}&agent=${platform}&voice=${encodeURIComponent(options.voiceId || '')}`;

    try {
      const res = await fetch('https://api.telnyx.com/v2/texml/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          To: cleanTo,
          From: cleanFrom,
          Url: answerUrl,
        }),
      });

      if (res.status >= 200 && res.status < 300) {
        const data = (await res.json().catch(() => ({}))) as any;
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.call_sid || data.data?.call_control_id || `telnyx_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      }
    } catch {
      // fallback to native agent API
    }
  }

  return { handled: false };
}
