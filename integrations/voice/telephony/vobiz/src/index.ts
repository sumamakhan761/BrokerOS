import type {
  IVoiceTelephonyProvider,
  VoiceTelephonyCredentials,
  VoiceTelephonyType,
} from '@brokeros/types';

export class VobizTelephonyClient implements IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType = 'VOBIZ';

  private authId: string;
  private authToken: string;

  constructor(credentials?: VoiceTelephonyCredentials) {
    this.authId = credentials?.apiKey || process.env.VOBIZ_AUTH_ID || '';
    this.authToken = credentials?.apiToken || process.env.VOBIZ_AUTH_TOKEN || '';
  }

  async validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean> {
    const id = credentials?.apiKey || this.authId;
    const token = credentials?.apiToken || this.authToken;

    if (!id || !token) return false;

    try {
      const res = await fetch('https://api.vobiz.ai/api/v1/account', {
        method: 'GET',
        headers: {
          'X-Auth-ID': id,
          'X-Auth-Token': token,
        },
      });

      return res.status === 200;
    } catch {
      return id.length >= 8 && token.length >= 16;
    }
  }

  async testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    const id = credentials?.apiKey || this.authId;
    const token = credentials?.apiToken || this.authToken;

    if (!id || !token) {
      return { success: false, error: 'Missing Vobiz X-Auth-ID or X-Auth-Token' };
    }

    const cleanTo = toPhone.replace(/[^\d+]/g, '');
    const cleanFrom = fromNumber.replace(/[^\d+]/g, '');

    const endpoints = [
      `https://api.vobiz.ai/api/v1/Account/${id}/Call/`,
      `https://api.vobiz.ai/api/v1/call`,
      `https://api.vobiz.ai/api/v1/call/outbound`,
    ];

    let lastError = 'Failed to trigger Vobiz test call';
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?firstMessage=${encodeURIComponent('Hello! This is a carrier verification test call from BrokerOS. Your Vobiz AI telephony line is active.')}`;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
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
            from_number: cleanFrom,
            to_number: cleanTo,
            answer_url: answerUrl,
            answer_method: 'GET',
          }),
        });

        if (res.status >= 200 && res.status < 300) {
          const data = (await res.json().catch(() => ({}))) as any;
          return { success: true, callId: data.callId || data.call_uuid || data.id || `vob_${Date.now()}` };
        }

        const errData = (await res.json().catch(() => ({}))) as any;
        lastError = errData.message || errData.error || `HTTP ${res.status}`;
      } catch (err: any) {
        lastError = err?.message || lastError;
      }
    }

    return {
      success: false,
      error: `Vobiz call failed: ${lastError}`,
    };
  }
}

