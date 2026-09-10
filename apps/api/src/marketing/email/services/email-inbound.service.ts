// ============================================================================
// BrokerOS — Inbound Email Parsing & Identity Resolution Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailAutomationEngineService } from '../automations/email-automation-engine.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import type { UniversalInboundEmailDto, SimulateInboundReplyDto } from '../dto/email-flows.dto.js';

@Injectable()
export class EmailInboundService {
  private readonly logger = new Logger(EmailInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: EmailAutomationEngineService,
    private readonly aiService: EmailAiService,
  ) { }

  /**
   * Universal processor for parsed inbound emails.
   */
  async handleInboundEmail(dto: UniversalInboundEmailDto) {
    const fromEmail = this.cleanEmail(dto.from);
    const toEmail = this.cleanEmail(dto.to);
    const subject = dto.subject || 'No Subject';
    const body = dto.text || dto.html?.replace(/<[^>]*>?/gm, '') || '';
    const provider = dto.provider || 'UNIVERSAL';
    const providerMsgId = dto.messageId;
    const inReplyTo = dto.inReplyTo;

    this.logger.log(`Received Inbound Email via ${provider}: from=${fromEmail} to=${toEmail}`);

    // 1. Resolve CampaignRecipient by envelope and previous thread
    let matchedRecipient = await this.prisma.campaignRecipient.findFirst({
      where: {
        email: { equals: fromEmail, mode: 'insensitive' },
        ...(toEmail ? { assignedSenderEmail: { equals: toEmail, mode: 'insensitive' } } : {}),
      },
      include: {
        campaign: {
          include: { project: true },
        },
        lead: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    // Fallback: match by In-Reply-To providerMsgId
    if (!matchedRecipient && inReplyTo) {
      matchedRecipient = await this.prisma.campaignRecipient.findFirst({
        where: { providerMsgId: inReplyTo },
        include: {
          campaign: { include: { project: true } },
          lead: true,
        },
      });
    }

    // Fallback: match by sender email only (most recent broadcast)
    if (!matchedRecipient) {
      matchedRecipient = await this.prisma.campaignRecipient.findFirst({
        where: { email: { equals: fromEmail, mode: 'insensitive' } },
        include: {
          campaign: { include: { project: true } },
          lead: true,
        },
        orderBy: { sentAt: 'desc' },
      });
    }

    // 2. Audit record in EmailInboundMessage
    const inboundLog = await this.prisma.emailInboundMessage.create({
      data: {
        fromEmail,
        toEmail,
        subject,
        textBody: dto.text || body,
        htmlBody: dto.html,
        headers: (dto.headers as any) || {},
        provider,
        providerMsgId,
        inReplyTo,
        matchedRecipientId: matchedRecipient?.id || null,
        matchedCampaignId: matchedRecipient?.campaignId || null,
        matchedLeadId: matchedRecipient?.leadId || null,
        status: matchedRecipient ? 'PROCESSED' : 'UNMATCHED',
      },
    });

    // 3. Dispatch to Email Automation Engine
    const automationResult = await this.automationEngine.processInboundReply({
      inboundId: inboundLog.id,
      fromEmail,
      toEmail,
      subject,
      body,
      headers: dto.headers,
      provider,
      providerMsgId,
      inReplyTo,
      recipient: matchedRecipient,
    });

    return {
      status: 'ok',
      inboundId: inboundLog.id,
      matchedRecipientId: matchedRecipient?.id || null,
      matchedCampaignTitle: matchedRecipient?.campaign?.title || null,
      assignedProvider: matchedRecipient?.assignedProvider || null,
      assignedSenderEmail: matchedRecipient?.assignedSenderEmail || null,
      actionsExecuted: automationResult.actionsExecuted,
    };
  }

  /**
   * Parse SendGrid Inbound Parse payload (multipart/form-data)
   */
  async parseSendgridInbound(body: any, headers?: any) {
    const from = body?.from || '';
    const to = body?.to || '';
    const subject = body?.subject || '';
    const text = body?.text || '';
    const html = body?.html || '';
    const messageId = headers?.['message-id'] || body?.['message-id'];
    const inReplyTo = headers?.['in-reply-to'] || body?.['in-reply-to'];

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'SENDGRID',
      headers,
    });
  }

  /**
   * Parse AWS SES SNS inbound receipt event
   */
  async parseSesInbound(body: any, headers?: any) {
    // SES sends SNS notification with Message JSON string or raw email
    let payload = body;
    if (typeof body === 'string') {
      try {
        payload = JSON.parse(body);
      } catch {
        payload = body;
      }
    }

    const mail = payload?.mail || payload?.Message?.mail || {};
    const from = mail?.source || mail?.commonHeaders?.from?.[0] || '';
    const to = mail?.destination?.[0] || mail?.commonHeaders?.to?.[0] || '';
    const subject = mail?.commonHeaders?.subject || '';
    const messageId = mail?.messageId;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text: payload?.content || subject,
      messageId,
      provider: 'AWS_SES',
      headers,
    });
  }

  /**
   * Parse Brevo Inbound Webhook payload
   */
  async parseBrevoInbound(body: any, headers?: any) {
    const from = body?.from?.email || body?.sender?.email || body?.from || '';
    const to = body?.to?.[0]?.email || body?.recipient || body?.to || '';
    const subject = body?.subject || '';
    const text = body?.text || body?.content || '';
    const html = body?.html || '';
    const messageId = body?.['message-id'] || body?.messageId;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      provider: 'BREVO',
      headers,
    });
  }

  /**
   * Parse Mailchimp / Mandrill Inbound events
   */
  async parseMailchimpInbound(body: any, headers?: any) {
    let events = body?.mandrill_events;
    if (typeof events === 'string') {
      try {
        events = JSON.parse(events);
      } catch {
        events = [];
      }
    }

    if (Array.isArray(events) && events.length > 0) {
      const first = events[0]?.msg || {};
      const from = first?.from_email || '';
      const to = first?.email || '';
      const subject = first?.subject || '';
      const text = first?.text || '';
      const html = first?.html || '';
      const messageId = first?._id;

      return this.handleInboundEmail({
        from,
        to,
        subject,
        text,
        html,
        messageId,
        provider: 'MAILCHIMP',
        headers,
      });
    }

    return this.handleInboundEmail({
      from: body?.from_email || body?.from || '',
      to: body?.to_email || body?.to || '',
      subject: body?.subject || '',
      text: body?.text || '',
      html: body?.html || '',
      provider: 'MAILCHIMP',
      headers,
    });
  }

  /**
   * Live Test Simulator: Injects a test lead reply without DNS MX setup
   */
  async simulateInboundReply(dto: SimulateInboundReplyDto) {
    const inboundRes = await this.handleInboundEmail({
      from: dto.leadEmail,
      to: dto.senderEmail,
      subject: dto.subject,
      text: dto.bodyText,
      provider: 'SIMULATOR',
    });

    // Generate real-time AI reply preview so the Live Concierge Test Bench
    // in Email AI Settings displays the full model output
    let aiReply: { subject: string; textBody: string; htmlBody: string } | null = null;
    let aiError: string | null = null;
    try {
      aiReply = await this.aiService.generateAutoreply({
        leadName: 'Prospect',
        inboundSubject: dto.subject,
        inboundBody: dto.bodyText,
        originalCampaignTitle: 'Skyline Crest Residences',
      });
    } catch (err: any) {
      aiError = err.message;
      this.logger.warn(`AI simulator preview notice: ${err.message}`);
    }

    const executedText = inboundRes.actionsExecuted?.length
      ? inboundRes.actionsExecuted.join('\n')
      : null;

    const outputText =
      aiReply?.textBody ||
      executedText ||
      (aiError ? `AI Notice: ${aiError}` : 'Inbound query processed successfully by Email Automation Engine.');

    return {
      ...inboundRes,
      summary: outputText,
      output: {
        text: outputText,
        subject: aiReply?.subject,
        html: aiReply?.htmlBody,
      },
    };
  }

  private cleanEmail(raw: string): string {
    if (!raw) return '';
    const match = raw.match(/<([^>]+)>/);
    const email = match ? match[1] : raw;
    return email.toLowerCase().trim();
  }
}
