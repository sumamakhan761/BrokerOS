// ============================================================================
// BrokerOS — WhatsApp Messages Service (Sending, History, Meta Retries)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient, type WhatsAppMessageType } from '@brokeros/prisma';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  sanitizePhoneForMeta,
  phoneVariants,
  isRecipientNotAllowedError,
} from '@brokeros/int-whatsapp';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';
import { WhatsAppFlowEngineService } from '../flows/whatsapp-flow-engine.service.js';
import type {
  SendWhatsAppMessageDto,
  SendWhatsAppTemplateDirectDto,
  ListWhatsAppMessagesQueryDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppMessagesService {
  private readonly logger = new Logger(WhatsAppMessagesService.name);
  private readonly prisma = prismaClient;

  constructor(
    private readonly configService: WhatsAppConfigService,
    private readonly realtimeGateway: WhatsAppRealtimeGateway,
    private readonly flowEngine: WhatsAppFlowEngineService,
  ) { }

  /**
   * Get messages for a conversation thread.
   */
  async getMessages(
    conversationId: string,
    query: ListWhatsAppMessagesQueryDto,
  ) {
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const page = Math.max(1, Number(query.page) || 1);
    const skip = (page - 1) * limit;

    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      select: { id: true, accountId: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    const where: Record<string, any> = { conversationId };

    const [items, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              headerText: true,
              bodyText: true,
              footerText: true,
              buttons: true,
            },
          },
        },
      }),
      this.prisma.whatsAppMessage.count({ where }),
    ]);

    const mappedItems = items.map((msg: any) => {
      if (msg.type === 'TEMPLATE' && !msg.body && msg.template?.bodyText) {
        return {
          ...msg,
          body: msg.template.bodyText,
        };
      }
      return msg;
    });

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send an outbound message (text, media, template, or interactive) to a contact.
   */
  async sendMessage(
    conversationId: string,
    dto: SendWhatsAppMessageDto,
    senderUser?: { id: string; name?: string },
  ) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    const account = await this.configService.getDecryptedAccount(
      conversation.accountId,
    );
    if (!account) {
      throw new BadRequestException(
        `Active WhatsApp account configuration not found for account ${conversation.accountId}`,
      );
    }

    const targetPhone = sanitizePhoneForMeta(
      conversation.contact?.phone || conversation.contactPhone,
    );
    if (!targetPhone) {
      throw new BadRequestException(
        'Recipient phone number is invalid or missing',
      );
    }

    const variants = phoneVariants(targetPhone);
    let metaResult: { messageId: string } | null = null;
    let successfulPhone = targetPhone;
    let lastError: any = null;

    // Retry loop across plausible phone trunk variants
    for (const variant of variants) {
      try {
        if (dto.type === 'text') {
          if (!dto.text)
            throw new BadRequestException('Text message body is required');
          metaResult = await sendTextMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: variant,
            text: dto.text,
            contextMessageId: dto.contextMessageId,
          });
        } else if (dto.type === 'media') {
          if (!dto.mediaUrl)
            throw new BadRequestException('Media URL is required');
          metaResult = await sendMediaMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: variant,
            kind: dto.mediaKind || 'image',
            link: dto.mediaUrl,
            caption: dto.caption,
            filename: dto.filename,
            contextMessageId: dto.contextMessageId,
          });
        } else if (dto.type === 'template') {
          if (!dto.templateName) {
            throw new BadRequestException('Template name is required');
          }
          metaResult = await sendTemplateMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: variant,
            templateName: dto.templateName,
            language: dto.templateLanguage || 'en_US',
            params: Array.isArray(dto.templateParams)
              ? dto.templateParams
              : undefined,
            contextMessageId: dto.contextMessageId,
          });
        } else if (dto.type === 'interactive') {
          const payload = dto.interactivePayload;
          if (!payload) {
            throw new BadRequestException('Interactive payload is required');
          }
          if (payload.kind === 'buttons' || payload.buttons) {
            metaResult = await sendInteractiveButtons({
              phoneNumberId: account.phoneNumberId,
              accessToken: account.accessToken,
              to: variant,
              bodyText: payload.body || payload.bodyText || '',
              headerText: payload.header || payload.headerText,
              footerText: payload.footer || payload.footerText,
              buttons: payload.buttons,
              contextMessageId: dto.contextMessageId,
            });
          } else {
            metaResult = await sendInteractiveList({
              phoneNumberId: account.phoneNumberId,
              accessToken: account.accessToken,
              to: variant,
              bodyText: payload.body || payload.bodyText || '',
              buttonLabel:
                payload.button_label || payload.buttonLabel || 'Select',
              headerText: payload.header || payload.headerText,
              footerText: payload.footer || payload.footerText,
              sections: payload.sections,
              contextMessageId: dto.contextMessageId,
            });
          }
        }

        if (metaResult?.messageId) {
          successfulPhone = variant;
          break;
        }
      } catch (err: any) {
        lastError = err;
        // If recipient not allowed or invalid format, try next variant
        if (!isRecipientNotAllowedError(err?.message || '')) {
          break; // Non-phone format error; don't loop variants
        }
      }
    }

    if (!metaResult?.messageId) {
      this.logger.error(
        `Failed to send WhatsApp message to ${targetPhone}: ${lastError?.message}`,
      );
      throw new BadRequestException(
        `WhatsApp delivery failed: ${lastError?.message || 'Meta API error'}`,
      );
    }

    // If variant differed from stored phone, update contact phone
    if (successfulPhone !== targetPhone && conversation.contactId) {
      await this.prisma.whatsAppContact
        .update({
          where: { id: conversation.contactId },
          data: { phone: successfulPhone },
        })
        .catch(() => null);
    }

    // Resolve template or media body
    let resolvedBody = dto.text || null;
    let templateId: string | null = null;

    if (dto.type === 'template' && dto.templateName) {
      const templateRecord = await this.prisma.whatsAppTemplate.findFirst({
        where: {
          accountId: account.id,
          name: dto.templateName,
        },
      });

      if (templateRecord) {
        templateId = templateRecord.id;
        let renderedBody = templateRecord.bodyText;
        if (Array.isArray(dto.templateParams) && dto.templateParams.length > 0) {
          dto.templateParams.forEach((param, idx) => {
            renderedBody = renderedBody.replace(
              new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'),
              String(param),
            );
          });
        }
        resolvedBody = renderedBody;
      } else {
        resolvedBody = dto.text || `[Template: ${dto.templateName}]`;
      }
    } else if (dto.type === 'media') {
      resolvedBody = dto.caption || dto.filename || null;
    }

    const previewText =
      resolvedBody ||
      dto.caption ||
      (dto.templateName ? `[Template: ${dto.templateName}]` : `[${dto.type}]`);

    let messageType: WhatsAppMessageType = 'TEXT';
    if (dto.type === 'media') {
      const kind = (dto.mediaKind || 'image').toLowerCase();
      if (kind === 'video') messageType = 'VIDEO';
      else if (kind === 'audio') messageType = 'AUDIO';
      else if (kind === 'document') messageType = 'DOCUMENT';
      else messageType = 'IMAGE';
    } else if (dto.type === 'template') {
      messageType = 'TEMPLATE';
    } else if (dto.type === 'interactive') {
      messageType = 'INTERACTIVE';
    } else {
      messageType = 'TEXT';
    }

    // Persist outbound message row
    const messageRow = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        waMessageId: metaResult.messageId,
        direction: 'OUTBOUND',
        type: messageType,
        status: 'SENT',
        senderType: 'agent',
        contentType: dto.type === 'media' ? (dto.mediaKind || 'image') : dto.type,
        senderName: senderUser?.name || 'Agent',
        body: resolvedBody,
        caption: dto.caption || null,
        mediaUrl: dto.mediaUrl || null,
        mediaType: dto.mediaKind || null,
        fileName: dto.filename || null,
        templateId,
        templateValues: dto.templateParams
          ? (dto.templateParams as any)
          : undefined,
        interactivePayload: dto.interactivePayload
          ? dto.interactivePayload
          : undefined,
        sentAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            headerText: true,
            bodyText: true,
            footerText: true,
            buttons: true,
          },
        },
      },
    });

    // Update conversation metadata
    await this.prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: previewText,
        lastMessageAt: messageRow.sentAt,
      },
    });

    // Broadcast real-time Socket.IO event
    this.realtimeGateway.emitMessageSent(
      conversation.id,
      messageRow,
      conversation.accountId,
    );

    // Agent preemption: pause active flow runs if agent manually replies
    this.flowEngine.handleAgentPreemption(conversation.id).catch(() => null);

    return messageRow;
  }

  /**
   * Send a template message directly to a contact or phone number.
   * Finds or creates contact and conversation thread if needed.
   */
  async sendTemplateDirect(
    dto: SendWhatsAppTemplateDirectDto,
    senderUser?: { id: string; name?: string },
  ) {
    if (!dto.templateName) {
      throw new BadRequestException('Template name is required');
    }
    if (!dto.contactId && !dto.to) {
      throw new BadRequestException(
        'Either contactId or to (recipient phone number) is required',
      );
    }

    let contact: any = null;
    let accountId = dto.accountId;

    if (dto.contactId) {
      contact = await this.prisma.whatsAppContact.findUnique({
        where: { id: dto.contactId },
      });
      if (!contact) {
        throw new NotFoundException(`Contact ${dto.contactId} not found`);
      }
      if (!accountId) {
        accountId = contact.accountId;
      }
    }

    if (!accountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });
      if (defaultAccount) {
        accountId = defaultAccount.id;
      }
    }

    if (!accountId) {
      throw new BadRequestException('Active WhatsApp account not found');
    }

    const rawPhone = contact?.phone || dto.to;
    const phone = sanitizePhoneForMeta(rawPhone);
    if (!phone) {
      throw new BadRequestException('Valid recipient phone number is required');
    }

    if (!contact) {
      contact = await this.prisma.whatsAppContact.findUnique({
        where: {
          accountId_phone: { accountId, phone },
        },
      });

      if (!contact) {
        const lead = await this.prisma.lead.findFirst({
          where: {
            OR: [{ phone }, { phone: `+${phone}` }],
            deletedAt: null,
          },
          select: { id: true, firstName: true, lastName: true },
        });

        contact = await this.prisma.whatsAppContact.create({
          data: {
            accountId,
            phone,
            name: lead
              ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || null
              : null,
            leadId: lead?.id || null,
          },
        });
      }
    }

    // Find or create active conversation thread
    let conversation = await this.prisma.whatsAppConversation.findFirst({
      where: {
        accountId,
        contactId: contact.id,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      conversation = await this.prisma.whatsAppConversation.create({
        data: {
          accountId,
          contactId: contact.id,
          contactPhone: phone,
          contactName: contact.name,
          status: 'open',
          isActive: true,
        },
      });
    }

    const messageRow = await this.sendMessage(
      conversation.id,
      {
        type: 'template',
        templateName: dto.templateName,
        templateLanguage: dto.templateLanguage || 'en_US',
        templateParams: dto.templateParams,
      },
      senderUser,
    );

    return {
      success: true,
      messageId: messageRow.id,
      conversationId: conversation.id,
      waMessageId: messageRow.waMessageId,
      message: messageRow,
    };
  }
}
