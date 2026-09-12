import type {
  DiscoveredSenderNumber,
  InboundSmsPayload,
  ISmsMarketingProvider,
  SendSmsOptions,
  SendSmsResult,
  SmsProviderCredentials,
  SmsProviderType,
  SmsWebhookEvent,
} from '@brokeros/types';

// ============================================================================
// Types
// ============================================================================

export interface TwilioWebhookPayload {
  MessageSid?: string;
  SmsSid?: string;
  AccountSid?: string;
  From?: string;
  To?: string;
  Body?: string;
  MessageStatus?: 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  SmsStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

// ============================================================================
// Client
// ============================================================================

export class TwilioSmsClient {
  private accountSid: string;
  private authToken: string;
  private messagingServiceSid?: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.accountSid = credentials?.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = credentials?.authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.messagingServiceSid = credentials?.messagingServiceSid || process.env.TWILIO_MESSAGING_SERVICE_SID;
    this.fromNumber = credentials?.fromNumber || process.env.TWILIO_PHONE_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.accountSid || !this.authToken) return false;
    if (!this.accountSid.startsWith('AC') || this.accountSid.length !== 34) return false;

    try {
      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`, {
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
      return this.accountSid.startsWith('AC') && this.authToken.length >= 32;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];

    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Twilio Default',
        provider: 'TWILIO',
        isVerified: true,
      });
    }

    if (!this.accountSid || !this.authToken) {
      return discovered;
    }

    try {
      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/IncomingPhoneNumbers.json?PageSize=50`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
        }
      );

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const numbers = data?.incoming_phone_numbers || [];
        for (const num of numbers) {
          const phone = num?.phone_number;
          if (phone && !discovered.some((d) => d.phoneNumber === phone)) {
            discovered.push({
              phoneNumber: phone,
              senderId: num?.friendly_name || 'Twilio Active',
              provider: 'TWILIO',
              isVerified: true,
            });
          }
        }
      }
    } catch {
      // Return existing discovered fallback
    }

    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.accountSid || !this.authToken) {
      return { isVerified: false, reason: 'Missing Twilio credentials' };
    }

    // If alphanumeric ID (e.g. SKYLIN)
    if (!clean.startsWith('+') && !/^\d+$/.test(clean)) {
      if (clean.length > 11) {
        return { isVerified: false, reason: 'Alphanumeric sender ID cannot exceed 11 characters' };
      }
      return { isVerified: true, formattedNumber: clean };
    }

    const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    const normalizedPhone = clean.startsWith('+') ? clean : `+${clean}`;

    try {
      // 1. Check if the number is an active IncomingPhoneNumber on the account
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(normalizedPhone)}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
        },
      );

      if (res.status === 200) {
        const data = (await res.json()) as any;
        if (data.incoming_phone_numbers && data.incoming_phone_numbers.length > 0) {
          const matched = data.incoming_phone_numbers[0];
          return {
            isVerified: true,
            formattedNumber: matched.phone_number || normalizedPhone,
          };
        }
      }

      // 2. Check if verified OutgoingCallerId
      const callerIdRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/OutgoingCallerIds.json?PhoneNumber=${encodeURIComponent(normalizedPhone)}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
        },
      );

      if (callerIdRes.status === 200) {
        const cidData = (await callerIdRes.json()) as any;
        if (cidData.outgoing_caller_ids && cidData.outgoing_caller_ids.length > 0) {
          return {
            isVerified: true,
            formattedNumber: cidData.outgoing_caller_ids[0].phone_number || normalizedPhone,
          };
        }
      }

      // 3. Check via Twilio Lookup API
      const lookupRes = await fetch(
        `https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(normalizedPhone)}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
        },
      );

      if (lookupRes.status === 200) {
        const lookupData = (await lookupRes.json()) as any;
        return {
          isVerified: true,
          formattedNumber: lookupData.phone_number || normalizedPhone,
        };
      }

      return {
        isVerified: false,
        reason: `Phone number ${normalizedPhone} was not found or verified in your Twilio account`,
      };
    } catch (err: any) {
      if (/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
        return { isVerified: true, formattedNumber: normalizedPhone };
      }
      return { isVerified: false, reason: err?.message || 'Carrier verification failed' };
    }
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.accountSid || !this.authToken) {
        return {
          success: false,
          provider: 'TWILIO',
          sentCount: 0,
          error: 'Missing Twilio Account SID or Auth Token',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'TWILIO',
          sentCount: 0,
          error: 'No recipients provided for Twilio SMS dispatch',
        };
      }

      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const failedRecipients: Array<{ phone: string; reason: string }> = [];
      let successCount = 0;
      let lastMsgId: string | undefined;

      // Intelligently resolve the effective Twilio sender identity:
      // Alphanumeric IDs (e.g. SKYLIN) fail on Twilio when sending to destinations like India (+91).
      // If options.from is alphanumeric or empty, prefer the verified E.164 phone number or MessagingServiceSid!
      let fromSender = (options.from || '').trim();
      if (this.messagingServiceSid && (!fromSender || fromSender.startsWith('MG') || !fromSender.startsWith('+'))) {
        fromSender = this.messagingServiceSid;
      } else if (this.fromNumber && (!fromSender || !fromSender.startsWith('+'))) {
        fromSender = this.fromNumber;
      } else if (!fromSender) {
        fromSender = this.fromNumber || this.messagingServiceSid || '';
      }

      for (const rec of options.to) {
        const params = new URLSearchParams();
        params.append('To', rec.phone);
        params.append('Body', options.message);

        if (fromSender.startsWith('MG')) {
          params.append('MessagingServiceSid', fromSender);
        } else {
          params.append('From', fromSender);
        }

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (res.status === 201 || res.status === 200) {
          const body = (await res.json()) as any;
          successCount++;
          lastMsgId = body?.sid;
        } else {
          const errBody = (await res.json().catch(() => ({}))) as any;
          failedRecipients.push({
            phone: rec.phone,
            reason: errBody?.message || `HTTP ${res.status}: ${res.statusText}`,
          });
        }
      }

      return {
        success: successCount > 0,
        provider: 'TWILIO',
        providerMessageId: lastMsgId,
        sentCount: successCount,
        failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
        error: successCount === 0 && failedRecipients.length > 0 ? failedRecipients[0].reason : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'TWILIO',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch SMS via Twilio',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class TwilioSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const item: TwilioWebhookPayload = payload;
    const messageId = item.MessageSid || item.SmsSid || 'unknown';
    const recipientPhone = item.To || '';
    const status = item.MessageStatus || item.SmsStatus;

    if (!recipientPhone) return events;

    if (status === 'delivered') {
      events.push({
        providerMessageId: messageId,
        recipientPhone,
        eventType: 'DELIVERED',
        timestamp: new Date(),
      });
    } else if (status === 'failed' || status === 'undelivered') {
      events.push({
        providerMessageId: messageId,
        recipientPhone,
        eventType: 'FAILED',
        timestamp: new Date(),
        metadata: {
          reason: item.ErrorMessage || item.ErrorCode || 'Undelivered',
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;
    const fromPhone = payload.From || payload.from || '';
    const toPhone = payload.To || payload.to || '';
    const textBody = payload.Body || payload.body || payload.text || '';
    const providerMsgId = payload.MessageSid || payload.SmsSid || payload.messageId;

    if (!fromPhone || !textBody) return null;

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'TWILIO',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class TwilioSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'TWILIO';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new TwilioSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new TwilioSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new TwilioSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new TwilioSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return TwilioSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return TwilioSmsWebhookParser.parseInbound(headers, payload);
  }
}
