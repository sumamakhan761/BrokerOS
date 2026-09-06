// ============================================================================
// BrokerOS — WhatsApp Inbound Webhook Processing Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  verifyMetaWebhookSignature,
  sanitizePhoneForMeta,
} from '@brokeros/int-whatsapp';
import type {
  MetaWebhookPayload,
  MetaMessageEntry,
  MetaStatusEntry,
} from '@brokeros/types';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';
import { WhatsAppAutomationEngineService } from '../automations/whatsapp-automation-engine.service.js';
import { WhatsAppFlowEngineService } from '../flows/whatsapp-flow-engine.service.js';
import { WhatsAppOutboundWebhooksService } from '../webhooks/whatsapp-outbound-webhooks.service.js';
import { WhatsAppAiService } from '../ai/whatsapp-ai.service.js';

@Injectable()
export class WhatsAppWebhookService {
  private readonly logger = new Logger(WhatsAppWebhookService.name);
  private readonly prisma = prismaClient;

  constructor(
    private readonly realtimeGateway: WhatsAppRealtimeGateway,
    private readonly automationEngine: WhatsAppAutomationEngineService,
    private readonly flowEngine: WhatsAppFlowEngineService,
    private readonly outboundWebhooks: WhatsAppOutboundWebhooksService,
    private readonly aiService: WhatsAppAiService,
  ) {}

  /**
   * Verify HMAC-SHA256 signature from Meta webhook request.
   */
  verifySignature(
    rawBody: string | Buffer,
    signature?: string | null,
    appSecret?: string,
  ): boolean {
    return verifyMetaWebhookSignature(rawBody, signature, appSecret);
  }

  /**
   * Main webhook event dispatcher.
   */
  async handleMetaPayload(payload: MetaWebhookPayload): Promise<void> {
    if (!payload?.entry || !Array.isArray(payload.entry)) {
      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        // Resolve account
        const account = await this.prisma.whatsAppBusinessAccount.findUnique({
          where: { phoneNumberId },
        });

        if (!account || !account.isActive) {
          this.logger.warn(
            `Ignoring webhook for unknown or inactive WhatsApp account: ${phoneNumberId}`,
          );
          continue;
        }

        // 1. Process Status Updates
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const status of value.statuses) {
            await this.handleStatusUpdate(account.id, status).catch((err) => {
              this.logger.error(
                `Status update error (${status.id}): ${err?.message}`,
              );
            });
          }
        }

        // 2. Process Inbound Messages
        if (value.messages && Array.isArray(value.messages)) {
          const contacts = value.contacts || [];
          for (let i = 0; i < value.messages.length; i++) {
            const message = value.messages[i];
            const contactMeta = contacts[i] || contacts[0];

            await this.handleInboundMessage(
              account.id,
              message,
              contactMeta,
            ).catch((err) => {
              this.logger.error(
                `Inbound message error (${message.id}): ${err?.message}`,
              );
            });
          }
        }
      }
    }
  }

  /**
   * Handle delivery/read/failed status updates from Meta.
   */
  async handleStatusUpdate(
    accountId: string,
    status: MetaStatusEntry,
  ): Promise<void> {
    const timestamp = status.timestamp
      ? new Date(parseInt(status.timestamp, 10) * 1000)
      : new Date();

    const statusUpper = status.status.toUpperCase();
    const prismaStatus =
      statusUpper === 'DELIVERED'
        ? ('DELIVERED' as const)
        : statusUpper === 'READ'
          ? ('READ' as const)
          : statusUpper === 'FAILED'
            ? ('FAILED' as const)
            : ('SENT' as const);

    const updateData: Record<string, any> = { status: prismaStatus };
    if (prismaStatus === 'DELIVERED') updateData.deliveredAt = timestamp;
    if (prismaStatus === 'READ') updateData.readAt = timestamp;
    if (prismaStatus === 'FAILED') {
      updateData.failedAt = timestamp;
      if (status.errors?.[0]?.message) {
        updateData.failureReason = status.errors[0].message;
      }
    }

    // 1. Update WhatsAppMessage row if present
    await this.prisma.whatsAppMessage
      .updateMany({
        where: { waMessageId: status.id },
        data: updateData,
      })
      .catch(() => null);

    // 2. Mirror status on WhatsAppBroadcastRecipient if this was a broadcast send
    const recipient = await this.prisma.whatsAppBroadcastRecipient
      .findUnique({
        where: { waMessageId: status.id },
        select: { id: true, broadcastId: true, status: true },
      })
      .catch(() => null);

    if (recipient) {
      await this.prisma
        .$transaction(async (tx) => {
          await tx.whatsAppBroadcastRecipient.update({
            where: { id: recipient.id },
            data: {
              status: prismaStatus,
              errorMessage: status.errors?.[0]?.message || null,
            },
          });

          // Increment aggregate counters on parent broadcast
          if (prismaStatus === 'DELIVERED') {
            await tx.whatsAppBroadcast.update({
              where: { id: recipient.broadcastId },
              data: { deliveredCount: { increment: 1 } },
            });
          } else if (prismaStatus === 'READ') {
            await tx.whatsAppBroadcast.update({
              where: { id: recipient.broadcastId },
              data: { readCount: { increment: 1 } },
            });
          } else if (prismaStatus === 'FAILED') {
            await tx.whatsAppBroadcast.update({
              where: { id: recipient.broadcastId },
              data: { failedCount: { increment: 1 } },
            });
          }
        })
        .catch((err) => {
          this.logger.error(
            `Broadcast recipient status update failed: ${err?.message}`,
          );
        });
    }

    // 3. Dispatch outbound webhook event to registered external endpoints
    this.outboundWebhooks.dispatchEvent(accountId, 'message.status', status);
  }

  /**
   * Handle an inbound customer message.
   */
  async handleInboundMessage(
    accountId: string,
    message: MetaMessageEntry,
    contactMeta?: { profile?: { name?: string }; wa_id?: string },
  ): Promise<void> {
    const rawPhone = message.from;
    const phone = sanitizePhoneForMeta(rawPhone);
    const contactName = contactMeta?.profile?.name || null;

    // 1. Find or create Contact
    const contact = await this.findOrCreateContact(
      accountId,
      phone,
      contactName,
    );

    // 2. Find or create Conversation
    const conversation = await this.findOrCreateConversation(
      accountId,
      contact.id,
      phone,
      contactName,
    );

    // 3. Extract message content and payload
    const { contentType, bodyText, mediaUrl, mediaType, interactivePayload } =
      this.extractMessageContent(message);

    // 4. Persist WhatsAppMessage
    const createdMessage = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        waMessageId: message.id,
        direction: 'INBOUND',
        type: this.mapMetaTypeToPrisma(message.type),
        status: 'RECEIVED',
        senderType: 'customer',
        contentType,
        senderName: contactName,
        body: bodyText,
        mediaUrl,
        mediaType,
        interactivePayload: interactivePayload
          ? (interactivePayload as any)
          : undefined,
        sentAt: message.timestamp
          ? new Date(parseInt(message.timestamp, 10) * 1000)
          : new Date(),
      },
    });

    // 5. Update Conversation preview and unread count
    const updatedConversation = await this.prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: bodyText || `[${contentType}]`,
        lastMessageAt: createdMessage.sentAt || new Date(),
        unreadCount: { increment: 1 },
        status: conversation.status === 'closed' ? 'open' : conversation.status,
      },
      include: {
        contact: true,
        agent: { select: { id: true, name: true, email: true } },
      },
    });

    // Broadcast real-time events to active subscribers
    this.realtimeGateway.emitMessageReceived(
      conversation.id,
      createdMessage,
      accountId,
    );
    this.realtimeGateway.emitConversationUpdated(
      accountId,
      updatedConversation,
    );

    this.logger.log(
      `Inbound WhatsApp message stored: ${message.id} from ${phone} in conversation ${conversation.id}`,
    );

    // 6. Trigger async downstream engines (non-blocking)
    this.dispatchDownstreamHooks(
      accountId,
      contact.id,
      conversation.id,
      createdMessage,
    );

    // 7. Dispatch outbound webhook event to external subscribed endpoints
    this.outboundWebhooks.dispatchEvent(
      accountId,
      'message.received',
      createdMessage,
    );
  }

  /**
   * Find an existing WhatsApp contact or create a new one.
   */
  private async findOrCreateContact(
    accountId: string,
    phone: string,
    name: string | null,
  ) {
    let contact = await this.prisma.whatsAppContact.findUnique({
      where: {
        accountId_phone: { accountId, phone },
      },
    });

    if (contact) {
      if (name && !contact.name) {
        contact = await this.prisma.whatsAppContact.update({
          where: { id: contact.id },
          data: { name },
        });
      }
      return contact;
    }

    // Check if CRM Lead exists with this phone to establish link
    const lead = await this.prisma.lead.findFirst({
      where: {
        OR: [{ phone: phone }, { phone: `+${phone}` }],
        deletedAt: null,
      },
      select: { id: true },
    });

    return this.prisma.whatsAppContact.create({
      data: {
        accountId,
        phone,
        name,
        leadId: lead?.id || null,
      },
    });
  }

  /**
   * Find an existing active conversation or create one.
   */
  private async findOrCreateConversation(
    accountId: string,
    contactId: string,
    phone: string,
    contactName: string | null,
  ) {
    const existing = await this.prisma.whatsAppConversation.findFirst({
      where: {
        accountId,
        contactId,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.whatsAppConversation.create({
      data: {
        accountId,
        contactId,
        contactPhone: phone,
        contactName,
        status: 'open',
        isActive: true,
      },
    });
  }

  /**
   * Parse Meta payload fields into structured message content.
   */
  private extractMessageContent(msg: MetaMessageEntry) {
    let contentType = msg.type || 'text';
    let bodyText: string | null = null;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    let interactivePayload: Record<string, unknown> | null = null;

    if (msg.text) {
      bodyText = msg.text.body;
    } else if (msg.image) {
      bodyText = msg.image.caption || null;
      mediaType = msg.image.mime_type;
      mediaUrl = `/api/marketing/whatsapp/media/${msg.image.id}`;
    } else if (msg.video) {
      bodyText = msg.video.caption || null;
      mediaType = msg.video.mime_type;
      mediaUrl = `/api/marketing/whatsapp/media/${msg.video.id}`;
    } else if (msg.document) {
      bodyText = msg.document.caption || msg.document.filename || null;
      mediaType = msg.document.mime_type;
      mediaUrl = `/api/marketing/whatsapp/media/${msg.document.id}`;
    } else if (msg.audio) {
      mediaType = msg.audio.mime_type;
      mediaUrl = `/api/marketing/whatsapp/media/${msg.audio.id}`;
      bodyText = msg.audio.voice ? '[Voice Note]' : '[Audio]';
    } else if (msg.interactive) {
      contentType = 'interactive';
      if (msg.interactive.button_reply) {
        bodyText = msg.interactive.button_reply.title;
        interactivePayload = {
          type: 'button_reply',
          id: msg.interactive.button_reply.id,
          title: msg.interactive.button_reply.title,
        };
      } else if (msg.interactive.list_reply) {
        bodyText = msg.interactive.list_reply.title;
        interactivePayload = {
          type: 'list_reply',
          id: msg.interactive.list_reply.id,
          title: msg.interactive.list_reply.title,
          description: msg.interactive.list_reply.description,
        };
      }
    } else if (msg.reaction) {
      contentType = 'reaction';
      bodyText = msg.reaction.emoji;
    } else if (msg.location) {
      contentType = 'location';
      bodyText =
        msg.location.name ||
        `${msg.location.latitude},${msg.location.longitude}`;
    }

    return {
      contentType,
      bodyText,
      mediaUrl,
      mediaType,
      interactivePayload,
    };
  }

  private mapMetaTypeToPrisma(metaType: string) {
    switch (metaType) {
      case 'text':
        return 'TEXT' as const;
      case 'image':
        return 'IMAGE' as const;
      case 'video':
        return 'VIDEO' as const;
      case 'document':
        return 'DOCUMENT' as const;
      case 'audio':
        return 'AUDIO' as const;
      case 'interactive':
        return 'INTERACTIVE' as const;
      case 'location':
        return 'LOCATION' as const;
      case 'contacts':
        return 'CONTACT' as const;
      default:
        return 'TEXT' as const;
    }
  }

  /**
   * Asynchronous dispatch hooks for downstream systems
   * (automations, flows, AI auto-reply, outbound webhooks).
   */
  private dispatchDownstreamHooks(
    accountId: string,
    contactId: string,
    conversationId: string,
    message: any,
  ) {
    // Non-blocking fire-and-forget
    setImmediate(async () => {
      try {
        const bodyText = message.body || '';
        const interactiveId = message.interactivePayload?.id;

        // 1. Check if first inbound message
        const firstInboundCount = await this.prisma.whatsAppMessage.count({
          where: {
            conversation: { contactId },
            direction: 'INBOUND',
          },
        });
        const isFirstInbound = firstInboundCount === 1;

        // 2. Dispatch to Flows Engine FIRST (wacrm law: active flow takes precedence)
        const flowResult = await this.flowEngine.dispatchInboundToFlows({
          accountId,
          contactId,
          conversationId,
          message: {
            kind: interactiveId
              ? message.interactivePayload?.type === 'list_reply'
                ? 'list_reply'
                : 'button_reply'
              : 'text',
            text: bodyText,
            replyId: interactiveId,
            replyTitle: message.interactivePayload?.title || bodyText,
          },
          isFirstInbound,
        });

        // If an active flow or matching flow handled the message, skip static keyword automations
        if (flowResult.handled) {
          return;
        }

        // 3. New message received trigger
        await this.automationEngine.runAutomationsForTrigger(
          accountId,
          'new_message_received',
          contactId,
          { messageText: bodyText, conversationId },
        );

        // 2. Keyword match trigger
        if (bodyText) {
          await this.automationEngine.runAutomationsForTrigger(
            accountId,
            'keyword_match',
            contactId,
            { messageText: bodyText, conversationId },
          );
        }

        // 3. Interactive reply trigger
        if (interactiveId) {
          await this.automationEngine.runAutomationsForTrigger(
            accountId,
            'interactive_reply',
            contactId,
            {
              interactiveReplyId: interactiveId,
              messageText: bodyText,
              conversationId,
            },
          );
        }

        // 4. First message received trigger
        const count = await this.prisma.whatsAppMessage.count({
          where: {
            conversation: { contactId },
            direction: 'INBOUND',
          },
        });
        if (count === 1) {
          await this.automationEngine.runAutomationsForTrigger(
            accountId,
            'first_inbound_message',
            contactId,
            { messageText: bodyText, conversationId },
          );
        }

        // 5. AI Assistant Auto-Reply (wacrm auto-reply law: fires if active and no agent/automations took it)
        await this.aiService.dispatchInboundToAiReply(
          accountId,
          conversationId,
          contactId,
        );
      } catch (err: any) {
        this.logger.error(`Downstream hook error: ${err?.message}`);
      }
    });
  }
}
