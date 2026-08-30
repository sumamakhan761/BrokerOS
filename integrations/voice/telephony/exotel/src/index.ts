import type {
  IVoiceTelephonyProvider,
  VoiceTelephonyCredentials,
  VoiceTelephonyType,
} from '@brokeros/types';

export class ExotelTelephonyClient implements IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType = 'EXOTEL';

  private apiKey: string;
  private apiToken: string;
  private accountSid: string;
  private subdomain: string;

  constructor(credentials?: VoiceTelephonyCredentials) {
    this.apiKey = credentials?.apiKey || process.env.EXOTEL_API_KEY || '';
    this.apiToken = credentials?.apiToken || process.env.EXOTEL_API_TOKEN || '';
    this.accountSid = credentials?.accountSid || process.env.EXOTEL_ACCOUNT_SID || '';
    this.subdomain = credentials?.subdomain || process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';
  }

  async validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    const token = credentials?.apiToken || this.apiToken;
    const sid = credentials?.accountSid || this.accountSid;
    const domain = credentials?.subdomain || this.subdomain || 'api.exotel.com';

    if (!key || !token || !sid) return false;

    try {
      const authHeader = Buffer.from(`${key}:${token}`).toString('base64');
      const res = await fetch(`https://${domain}/v1/Accounts/${sid}.json`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      });

      return res.status === 200 || res.status === 201;
    } catch {
      return key.length >= 10 && token.length >= 10 && sid.length >= 5;
    }
  }

  private formatExotelNumber(raw: string): string {
    if (!raw) return '';
    let cleaned = raw.replace(/[^\d]/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = '0' + cleaned.slice(2);
    } else if (cleaned.length === 10) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  }

  async testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    const key = credentials?.apiKey || this.apiKey;
    const token = credentials?.apiToken || this.apiToken;
    const sid = credentials?.accountSid || this.accountSid;
    const domain = credentials?.subdomain || this.subdomain || 'api.exotel.com';

    if (!key || !token || !sid) {
      return { success: false, error: 'Missing Exotel API Key, Token, or Account SID' };
    }

    try {
      const authHeader = Buffer.from(`${key}:${token}`).toString('base64');
      const cleanCallerId = this.formatExotelNumber(fromNumber);
      const cleanToPhone = this.formatExotelNumber(toPhone);

      const body = new URLSearchParams({
        From: cleanToPhone,
        To: cleanCallerId,
        CallerId: cleanCallerId,
        CallType: 'trans',
        TimeLimit: '30',
        TimeOut: '20',
      });

      const res = await fetch(`https://${domain}/v1/Accounts/${sid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.status >= 200 && res.status < 300) {
        const callSid = data?.Call?.Sid || data?.sid || `exo_${Date.now()}`;
        return { success: true, callId: callSid };
      }

      return {
        success: false,
        error: data?.RestException?.Message || data?.message || `Exotel call failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to trigger Exotel test call',
      };
    }
  }
}
