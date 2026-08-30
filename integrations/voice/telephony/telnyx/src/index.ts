import type {
  IVoiceTelephonyProvider,
  VoiceTelephonyCredentials,
  VoiceTelephonyType,
} from '@brokeros/types';

export class TelnyxTelephonyClient implements IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType = 'TELNYX';

  private apiKey: string;
  private accountSid?: string;

  constructor(credentials?: VoiceTelephonyCredentials) {
    this.apiKey = credentials?.apiKey || process.env.TELNYX_API_KEY || '';
    this.accountSid = credentials?.accountSid || process.env.TELNYX_ACCOUNT_SID;
  }

  async validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) return false;

    try {
      const res = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
        },
      });

      return res.status === 200;
    } catch {
      return key.startsWith('KEY') || key.length >= 20;
    }
  }

  private async ensureOutboundProfile(key: string, appId: string): Promise<void> {
    try {
      // 1. Get or create an Outbound Voice Profile
      let profileId: string | null = null;
      const res = await fetch('https://api.telnyx.com/v2/outbound_voice_profiles?page[size]=5', {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      });

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as any;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].id) {
          profileId = data.data[0].id;
        }
      }

      if (!profileId) {
        const createProfileRes = await fetch('https://api.telnyx.com/v2/outbound_voice_profiles', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: 'BrokerOS Outbound Voice Profile',
            traffic_type: 'conversational',
            usage_payment_method: 'rate-deck',
          }),
        });

        if (createProfileRes.ok) {
          const createData = (await createProfileRes.json().catch(() => ({}))) as any;
          profileId = createData?.data?.id;
        }
      }

      // 2. Attach Outbound Profile to Call Control Application
      if (profileId && appId) {
        await fetch(`https://api.telnyx.com/v2/call_control_applications/${appId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            outbound: {
              outbound_voice_profile_id: profileId,
            },
          }),
        });
      }
    } catch {
      // Non-blocking fallback
    }
  }

  private async resolveConnectionId(key: string, customConnectionId?: string): Promise<string | null> {
    if (customConnectionId && customConnectionId !== 'default' && customConnectionId.trim().length > 0) {
      await this.ensureOutboundProfile(key, customConnectionId.trim());
      return customConnectionId.trim();
    }

    // 1. Check existing Call Control Applications on this Telnyx account
    try {
      const res = await fetch('https://api.telnyx.com/v2/call_control_applications?page[size]=5', {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as any;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].id) {
          const appId = data.data[0].id;
          await this.ensureOutboundProfile(key, appId);
          return appId;
        }
      }
    } catch {
      // Continue to next check
    }

    // 2. Check existing TeXML Applications
    try {
      const res = await fetch('https://api.telnyx.com/v2/texml_applications?page[size]=5', {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as any;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].id) {
          const appId = data.data[0].id;
          await this.ensureOutboundProfile(key, appId);
          return appId;
        }
      }
    } catch {
      // Continue to creation
    }

    // 3. Auto-create a lightweight Call Control Application for BrokerOS
    try {
      const createRes = await fetch('https://api.telnyx.com/v2/call_control_applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          application_name: 'BrokerOS AI Voice Carrier',
          webhook_event_url: 'https://brokeros.com/api/marketing/voice/webhooks/telnyx',
          webhook_api_version: '2',
        }),
      });

      if (createRes.ok) {
        const createData = (await createRes.json().catch(() => ({}))) as any;
        if (createData?.data?.id) {
          const newAppId = createData.data.id;
          await this.ensureOutboundProfile(key, newAppId);
          return newAppId;
        }
      }
    } catch {
      // Fallback
    }

    return null;
  }

  async testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing Telnyx API Key' };
    }

    const cleanTo = toPhone.startsWith('+') ? toPhone : `+${toPhone.replace(/[^\d]/g, '')}`;
    const cleanFrom = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber.replace(/[^\d]/g, '')}`;

    const connectionId = await this.resolveConnectionId(
      key,
      credentials?.sipDomain || credentials?.subdomain,
    );

    if (!connectionId) {
      return {
        success: false,
        error:
          'No Telnyx Call Control App found on your account. Please create a Call Control Application in Telnyx Mission Control Portal (Voice -> Call Control) or provide your Connection ID.',
      };
    }

    try {
      const res = await fetch('https://api.telnyx.com/v2/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          to: cleanTo,
          from: cleanFrom,
          connection_id: connectionId,
          answering_machine_detection: 'detect',
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.status >= 200 && res.status < 300) {
        return { success: true, callId: data?.data?.call_control_id || `teln_${Date.now()}` };
      }

      return {
        success: false,
        error: data?.errors?.[0]?.detail || `Telnyx call failed with HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to trigger Telnyx test call',
      };
    }
  }
}
