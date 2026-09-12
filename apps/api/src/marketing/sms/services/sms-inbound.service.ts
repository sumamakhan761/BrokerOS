// ============================================================================
// BrokerOS — Inbound SMS Parsing & Identity Resolution Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { SmsAutomationEngineService } from '../automations/sms-automation-engine.service.js';
import { SmsAiService } from '../ai/sms-ai.service.js';
import { calculateSmsSegments } from '@brokeros/constants';
import type {
  UniversalInboundSmsDto,
  SimulateInboundSmsReplyDto,
} from '../dto/sms-flows.dto.js';

@Injectable()
export class SmsInboundService {
  private readonly logger = new Logger(SmsInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: SmsAutomationEngineService,
    private readonly aiService: SmsAiService,
  ) {}

  /**
   * Universal processor for inbound SMS messages from carrier webhooks.
   */
  async handleInboundSms(dto: UniversalInboundSmsDto) {
    const fromPhone = this.cleanPhone(dto.from);
    const toPhone = this.cleanPhone(dto.to);
    const body = dto.text?.trim() || '';
    const provider = dto.provider || 'UNIVERSAL';
    const providerMsgId = dto.messageId;

    this.logger.log(`Received Inbound SMS via ${provider}: from=${fromPhone} to=${toPhone}`);

    // 1. Resolve past recipient by phone
    let matchedRecipient = await this.prisma.smsRecipient.findFirst({
      where: {
        phone: fromPhone,
      },
      include: {
        campaign: {
          include: { project: true },
        },
        lead: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    if (!matchedRecipient) {
      // Try suffix match for international dialing codes
      matchedRecipient = await this.prisma.smsRecipient.findFirst({
        where: {
          phone: { endsWith: fromPhone.slice(-10) },
        },
        include: {
          campaign: { include: { project: true } },
          lead: true,
        },
        orderBy: { sentAt: 'desc' },
      });
    }

    // 2. Audit record in SmsInboundMessage
    await this.prisma.smsInboundMessage.create({
      data: {
        fromPhone,
        toPhone,
        textBody: body,
        headers: (dto.headers as any) || {},
        provider,
        providerMsgId,
        matchedRecipientId: matchedRecipient?.id || null,
        matchedCampaignId: matchedRecipient?.campaignId || null,
        matchedLeadId: matchedRecipient?.leadId || null,
        status: matchedRecipient ? 'PROCESSED' : 'UNMATCHED',
      },
    });

    // 3. Sync to 2-Way Live Team Inbox (SmsConversation & SmsMessage)
    try {
      let conversation = await this.prisma.smsConversation.findFirst({
        where: {
          contactPhone: fromPhone,
          isActive: true,
        },
      });

      const contactName =
        matchedRecipient?.name ||
        (matchedRecipient?.lead
          ? `${matchedRecipient.lead.firstName || ''} ${matchedRecipient.lead.lastName || ''}`.trim()
          : null) ||
        fromPhone;

      let resolvedSenderPhone = toPhone || matchedRecipient?.assignedSenderPhone;
      let resolvedProvider = matchedRecipient?.assignedProvider || provider;

      if (!resolvedSenderPhone) {
        const activeIntegration = await this.prisma.smsIntegration.findFirst({
          where: { isActive: true },
          include: { senderNumbers: { where: { isVerified: true }, orderBy: { createdAt: 'asc' } } },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        resolvedProvider = resolvedProvider || activeIntegration?.provider || 'TWILIO';
        resolvedSenderPhone = activeIntegration?.senderNumbers[0]?.phoneNumber || activeIntegration?.senderNumbers[0]?.senderId || activeIntegration?.fromSender || '';
      }

      if (!conversation) {
        conversation = await this.prisma.smsConversation.create({
          data: {
            contactPhone: fromPhone,
            contactName,
            leadId: matchedRecipient?.leadId || null,
            campaignId: matchedRecipient?.campaignId || null,
            recipientId: matchedRecipient?.id || null,
            assignedProvider: resolvedProvider,
            assignedSenderPhone: resolvedSenderPhone,
            status: 'open',
            unreadCount: 1,
            lastMessageText: body.slice(0, 160) || 'New inbound SMS',
            lastMessageAt: new Date(),
          },
        });
      } else {
        conversation = await this.prisma.smsConversation.update({
          where: { id: conversation.id },
          data: {
            unreadCount: { increment: 1 },
            lastMessageText: body.slice(0, 160) || 'New inbound reply',
            lastMessageAt: new Date(),
            status: 'open',
            ...(matchedRecipient?.leadId && !conversation.leadId ? { leadId: matchedRecipient.leadId } : {}),
            ...(matchedRecipient?.assignedProvider ? { assignedProvider: matchedRecipient.assignedProvider } : {}),
            ...(toPhone ? { assignedSenderPhone: toPhone } : {}),
          },
        });
      }

      const { segments } = calculateSmsSegments(body);

      await this.prisma.smsMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'INBOUND',
          senderType: 'contact',
          senderName: contactName,
          fromPhone,
          toPhone,
          bodyText: body,
          segmentsCount: segments,
          status: 'DELIVERED',
          provider,
          providerMsgId: providerMsgId || `inbound-${Date.now()}`,
          deliveredAt: new Date(),
        },
      });
    } catch (inboxErr: any) {
      this.logger.error(`Failed to sync inbound SMS to team inbox: ${inboxErr.message}`);
    }

    // 4. Trigger Automation Engine & Visual Flows
    const flowResult = await this.automationEngine.processInboundReply({
      fromPhone,
      toPhone,
      body,
      provider,
      providerMsgId,
      recipient: matchedRecipient,
      isSimulation: false,
    });

    return {
      success: true,
      fromPhone,
      toPhone,
      matchedRecipientId: matchedRecipient?.id || null,
      flowResult,
    };
  }

  /**
   * Interactive test simulation runner for SMS Flows
   */
  async simulateInboundReply(dto: SimulateInboundSmsReplyDto) {
    const leadPhone = this.cleanPhone(dto.leadPhone);
    let senderPhone = this.cleanPhone(dto.senderPhone);
    const body = dto.bodyText.trim();

    if (!senderPhone) {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { isActive: true },
        include: { senderNumbers: { where: { isVerified: true }, orderBy: { createdAt: 'asc' } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      senderPhone = activeIntegration?.senderNumbers[0]?.phoneNumber || activeIntegration?.senderNumbers[0]?.senderId || activeIntegration?.fromSender || '';
    }

    const matchedRecipient = await this.prisma.smsRecipient.findFirst({
      where: { phone: leadPhone },
      include: {
        campaign: { include: { project: true } },
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const flowResult = await this.automationEngine.processInboundReply({
      fromPhone: leadPhone,
      toPhone: senderPhone,
      body,
      provider: 'SIMULATOR',
      recipient: matchedRecipient,
      forceFlowId: dto.flowId,
      isSimulation: true,
    });

    return {
      simulation: true,
      leadPhone,
      senderPhone,
      body,
      flowResult,
    };
  }

  private cleanPhone(raw: string): string {
    if (!raw) return '';
    return raw.replace(/[^\d+]/g, '');
  }
}
