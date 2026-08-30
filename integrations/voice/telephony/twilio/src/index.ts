import type {
  IVoiceTelephonyProvider,
  VoiceTelephonyCredentials,
  VoiceTelephonyType,
} from '@brokeros/types';

export class TwilioTelephonyClient implements IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType = 'TWILIO';

  private accountSid: string;
  private authToken: string;

  constructor(credentials?: VoiceTelephonyCredentials) {
    this.accountSid = credentials?.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = credentials?.authToken || process.env.TWILIO_AUTH_TOKEN || '';
  }

  async validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean> {
    const sid = credentials?.accountSid || this.accountSid;
    const token = credentials?.authToken || this.authToken;

    if (!sid || !token) return false;
    if (!sid.startsWith('AC') || sid.length !== 34) return false;

    try {
      const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        return data?.status === 'active';
      }
      return false;
    } catch {
      return sid.startsWith('AC') && token.length >= 32;
    }
  }

  async testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    const sid = credentials?.accountSid || this.accountSid;
    const token = credentials?.authToken || this.authToken;

    if (!sid || !token) {
      return { success: false, error: 'Missing Twilio Account SID or Auth Token' };
    }

    try {
      const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');
      const twiml = '<Response><Say voice="Polly.Aditi">Hello! This is a carrier verification test call from BrokerOS. Your Twilio telephony connection is fully active and verified.</Say><Pause length="1"/><Hangup/></Response>';

      const body = new URLSearchParams({
        To: toPhone,
        From: fromNumber,
        Twiml: twiml,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await res.json()) as any;

      if (res.status >= 200 && res.status < 300) {
        return { success: true, callId: data.sid };
      }

      return {
        success: false,
        error: data.message || `Twilio call failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to trigger Twilio test call',
      };
    }
  }
}
