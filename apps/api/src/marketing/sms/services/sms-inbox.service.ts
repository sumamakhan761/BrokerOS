// ============================================================================
// BrokerOS — SMS Inbox Service (2-Way Team Inbox with Thread Continuity)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { SmsIntegrationsService } from './sms-integrations.service.js';
import { SmsAiService } from '../ai/sms-ai.service.js';
import { calculateSmsSegments } from '@brokeros/constants';
import type {
  ListSmsConversationsQueryDto,
  StartSmsConversationDto,
  SendSmsReplyDto,
  ListSmsMessagesQueryDto,
} from '../dto/sms-inbox.dto.js';
import type { SmsProviderCredentials } from '@brokeros/types';

@Injectable()
export class SmsInboxService {
  private readonly logger = new Logger(SmsInboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: SmsIntegrationsService,
    private readonly aiService: SmsAiService,
  ) {}

  /**
   * List paginated SMS conversations with status filtering and phone search.
   */
  async listConversations(query: ListSmsConversationsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.status && ['open', 'pending', 'closed'].includes(query.status)) {
      where.status = query.status;
    }

    if (query.agentId) {
      where.agentUserId = query.agentId;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { contactPhone: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { lastMessageText: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.smsConversation.findMany({
        where,
        include: {
          agent: {
            select: { id: true, name: true, email: true },
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
              temperature: true,
              budget: true,
            },
          },
          campaign: {
            select: { id: true, title: true },
          },
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.smsConversation.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single conversation by ID
   */
  async getConversation(id: string) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id },
      include: {
        agent: {
          select: { id: true, name: true, email: true },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            temperature: true,
            budget: true,
          },
        },
        campaign: {
          select: { id: true, title: true },
        },
      },
    });

    if (!conv) {
      throw new NotFoundException(`SMS conversation #${id} not found`);
    }

    return conv;
  }

  /**
   * Get chronological messages in conversation
   */
  async getMessages(conversationId: string, query?: ListSmsMessagesQueryDto) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      throw new NotFoundException(`SMS conversation #${conversationId} not found`);
    }

    const messages = await this.prisma.smsMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      conversationId,
      items: messages,
      total: messages.length,
    };
  }

  /**
   * Start a new conversation or return existing active one
   */
  async startConversation(
    dto: StartSmsConversationDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const contactPhone = dto.contactPhone.trim();

    let lead: any = null;
    if (dto.leadId) {
      lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    }

    const contactName =
      dto.contactName ||
      (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : '') ||
      contactPhone;

    let existing = await this.prisma.smsConversation.findFirst({
      where: {
        contactPhone,
        isActive: true,
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: true,
      },
    });

    if (existing) {
      if (dto.initialMessage?.trim()) {
        await this.sendReply(
          existing.id,
          { text: dto.initialMessage.trim() },
          senderUser,
        );
      }
      return existing;
    }

    // Resolve default provider and sender number if not specified
    let provider = dto.assignedProvider || 'TWILIO';
    let senderPhone = dto.assignedSenderPhone || dto.assignedSenderId;

    if (!senderPhone) {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (activeIntegration) {
        provider = activeIntegration.provider;
        senderPhone = activeIntegration.fromSender;
      } else {
        senderPhone = '+14155550199';
      }
    }

    const created = await this.prisma.smsConversation.create({
      data: {
        contactPhone,
        contactName,
        leadId: dto.leadId || lead?.id || null,
        agentUserId: senderUser?.id || null,
        assignedProvider: provider,
        assignedSenderPhone: senderPhone,
        status: 'open',
        unreadCount: 0,
        lastMessageText: dto.initialMessage?.slice(0, 150) || 'Conversation started',
        lastMessageAt: new Date(),
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: true,
      },
    });

    if (dto.initialMessage?.trim()) {
      await this.sendReply(
        created.id,
        { text: dto.initialMessage.trim() },
        senderUser,
      );
    }

    return created;
  }

  /**
   * Send 2-way outbound reply strictly adhering to the Thread Continuity Invariant.
   * Dispatches strictly via the conversation's assignedProvider and assignedSenderPhone.
   */
  async sendReply(
    conversationId: string,
    dto: SendSmsReplyDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
      include: { lead: true },
    });

    if (!conv) {
      throw new NotFoundException(`SMS Conversation #${conversationId} not found`);
    }

    const textContent = dto.text?.trim() || '';
    if (!textContent) {
      throw new BadRequestException('Message text cannot be empty');
    }

    const provider = conv.assignedProvider || 'TWILIO';
    const fromPhone = conv.assignedSenderPhone || '+14155550199';
    const fromName = senderUser?.name || 'Sales Team';

    const { segments } = calculateSmsSegments(textContent);

    // Resolve provider credentials for the dedicated provider
    let credentials: SmsProviderCredentials | undefined;
    const integration = await this.prisma.smsIntegration.findFirst({
      where: { provider: provider as any, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    if (integration) {
      credentials = {
        accountSid: integration.accountSid || undefined,
        authToken: integration.authToken || undefined,
        messagingServiceSid: integration.messagingServiceSid || undefined,
        apiKey: integration.apiKey || undefined,
        servicePlanId: integration.servicePlanId || undefined,
        awsAccessKeyId: integration.awsAccessKeyId || undefined,
        awsSecretKey: integration.awsSecretKey || undefined,
        awsRegion: integration.awsRegion || undefined,
        dltEntityId: integration.dltEntityId || undefined,
        fromNumber: fromPhone,
        senderId: fromPhone,
      };
    }

    let providerMsgId: string | null = null;
    try {
      const adapter = this.integrationsService.getAdapter(provider);
      const sendRes = await adapter.sendBatch(
        {
          from: fromPhone,
          to: [{ phone: conv.contactPhone, name: conv.contactName || undefined }],
          message: textContent,
        },
        credentials,
      );

      providerMsgId = sendRes.providerMessageId || null;
      this.logger.log(
        `Inbox Outbound SMS dispatched via ${provider}: to=${conv.contactPhone} msgId=${providerMsgId}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to dispatch SMS via ${provider}: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException(`SMS delivery failed: ${err.message}`);
      }
    }

    const createdMessage = await this.prisma.smsMessage.create({
      data: {
        conversationId,
        direction: 'OUTBOUND',
        senderType: 'agent',
        senderName: fromName,
        fromPhone,
        toPhone: conv.contactPhone,
        bodyText: textContent,
        segmentsCount: segments,
        status: providerMsgId ? 'DELIVERED' : 'SENT',
        provider,
        providerMsgId: providerMsgId || `local-${Date.now()}`,
        sentAt: new Date(),
        deliveredAt: providerMsgId ? new Date() : null,
      },
    });

    await this.prisma.smsConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: textContent.slice(0, 160),
        lastMessageAt: new Date(),
        unreadCount: 0,
      },
    });

    return createdMessage;
  }

  async updateStatus(id: string, status: 'open' | 'pending' | 'closed') {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { status },
    });
  }

  async assignAgent(id: string, agentUserId: string | null) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { agentUserId },
      include: {
        agent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async toggleAiAutoReply(id: string, disabled: boolean) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { aiAutoReplyDisabled: disabled },
    });
  }

  async markRead(id: string) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }

  async draftAiReply(conversationId: string) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
      include: {
        lead: true,
        campaign: true,
      },
    });

    if (!conv) {
      throw new NotFoundException(`SMS Conversation #${conversationId} not found`);
    }

    const latestInbound = await this.prisma.smsMessage.findFirst({
      where: { conversationId, direction: 'INBOUND' },
      orderBy: { createdAt: 'desc' },
    });

    const leadName = conv.contactName || conv.lead?.firstName || 'Prospect';
    const inboundBody = latestInbound?.bodyText || conv.lastMessageText || 'Could you send more details?';
    const campaignTitle = conv.campaign?.title || 'Luxury Residences';

    const aiRes = await this.aiService.generateAutoreply({
      leadName,
      inboundBody,
      originalCampaignTitle: campaignTitle,
    });

    return {
      text: aiRes.text,
      modelUsed: aiRes.modelUsed,
    };
  }
}
