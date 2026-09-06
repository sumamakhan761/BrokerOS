// ============================================================================
// BrokerOS — WhatsApp Conversations Service
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { sanitizePhoneForMeta } from '@brokeros/int-whatsapp';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';
import type {
  ListWhatsAppConversationsQueryDto,
  StartWhatsAppConversationDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppConversationsService {
  private readonly logger = new Logger(WhatsAppConversationsService.name);
  private readonly prisma = prismaClient;

  constructor(private readonly realtimeGateway: WhatsAppRealtimeGateway) {}

  /**
   * List paginated conversations with filtering and search.
   * Auto-provisions conversations for any active contacts that lack one.
   */
  async listConversations(
    query: ListWhatsAppConversationsQueryDto,
    scopedAccountId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;

    // Auto-provision conversation records for any active contacts that don't have one yet
    try {
      const contactsWithoutConv = await this.prisma.whatsAppContact.findMany({
        where: {
          deletedAt: null,
          conversations: { none: {} },
          ...(accountId ? { accountId } : {}),
        },
        take: 50,
      });

      if (contactsWithoutConv.length > 0) {
        for (const c of contactsWithoutConv) {
          await this.prisma.whatsAppConversation
            .create({
              data: {
                accountId: c.accountId,
                contactId: c.id,
                contactPhone: c.phone,
                contactName: c.name,
                leadId: c.leadId,
                status: 'open',
                isActive: true,
              },
            })
            .catch(() => null);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Auto-provisioning conversations skipped: ${err?.message}`);
    }

    const where: Record<string, any> = {
      isActive: true,
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (query.status && ['open', 'pending', 'closed'].includes(query.status)) {
      where.status = query.status;
    }

    if (query.agentId) {
      where.agentUserId = query.agentId;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { contactPhone: { contains: term, mode: 'insensitive' } },
        { contactName: { contains: term, mode: 'insensitive' } },
        { lastMessageText: { contains: term, mode: 'insensitive' } },
        {
          contact: {
            name: { contains: term, mode: 'insensitive' },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.whatsAppConversation.findMany({
        where,
        include: {
          contact: {
            include: {
              tags: {
                include: { tag: true },
              },
            },
          },
          agent: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.whatsAppConversation.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Start or get active conversation with contact or phone number.
   */
  async startOrCreateConversation(dto: StartWhatsAppConversationDto) {
    if (!dto.contactId && !dto.phone && !dto.leadId) {
      throw new BadRequestException(
        'Either contactId, phone, or leadId is required',
      );
    }

    let accountId = dto.accountId;
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
      throw new BadRequestException(
        'Active WhatsApp business account not found',
      );
    }

    let contact: any = null;

    if (dto.contactId) {
      contact = await this.prisma.whatsAppContact.findUnique({
        where: { id: dto.contactId },
      });
    }

    if (!contact && dto.phone) {
      const cleanPhone = sanitizePhoneForMeta(dto.phone);
      if (cleanPhone) {
        contact = await this.prisma.whatsAppContact.findUnique({
          where: { accountId_phone: { accountId, phone: cleanPhone } },
        });

        if (!contact) {
          const lead = await this.prisma.lead.findFirst({
            where: {
              OR: [{ phone: cleanPhone }, { phone: `+${cleanPhone}` }],
              deletedAt: null,
            },
            select: { id: true, firstName: true, lastName: true },
          });

          contact = await this.prisma.whatsAppContact.create({
            data: {
              accountId,
              phone: cleanPhone,
              name:
                dto.name ||
                (lead
                  ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                  : null),
              leadId: dto.leadId || lead?.id || null,
            },
          });
        }
      }
    }

    if (!contact && dto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: dto.leadId },
      });
      if (lead?.phone) {
        const cleanPhone = sanitizePhoneForMeta(lead.phone);
        if (cleanPhone) {
          contact = await this.prisma.whatsAppContact.findUnique({
            where: { accountId_phone: { accountId, phone: cleanPhone } },
          });
          if (!contact) {
            contact = await this.prisma.whatsAppContact.create({
              data: {
                accountId,
                phone: cleanPhone,
                name:
                  `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
                  null,
                leadId: lead.id,
              },
            });
          }
        }
      }
    }

    if (!contact) {
      throw new NotFoundException(
        'Could not resolve contact to start conversation',
      );
    }

    let conversation = await this.prisma.whatsAppConversation.findFirst({
      where: {
        accountId,
        contactId: contact.id,
        isActive: true,
      },
      include: {
        contact: {
          include: {
            tags: { include: { tag: true } },
          },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      conversation = await this.prisma.whatsAppConversation.create({
        data: {
          accountId,
          contactId: contact.id,
          contactPhone: contact.phone,
          contactName: contact.name,
          leadId: contact.leadId,
          status: 'open',
          isActive: true,
        },
        include: {
          contact: {
            include: {
              tags: { include: { tag: true } },
            },
          },
          agent: {
            select: { id: true, name: true, email: true },
          },
          lead: {
            select: { id: true, firstName: true, lastName: true, status: true },
          },
        },
      });
    }

    this.realtimeGateway.emitConversationUpdated(
      conversation.accountId,
      conversation,
    );
    return conversation;
  }

  /**
   * Get single conversation thread metadata.
   */
  async getConversation(id: string, accountId?: string) {
    const where: Record<string, any> = { id };
    if (accountId) where.accountId = accountId;

    const conversation = await this.prisma.whatsAppConversation.findFirst({
      where,
      include: {
        contact: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, status: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    return conversation;
  }

  /**
   * Update conversation status (open, pending, closed).
   */
  async updateStatus(
    id: string,
    status: 'open' | 'pending' | 'closed',
    accountId?: string,
  ) {
    const conv = await this.getConversation(id, accountId);

    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: { status },
      include: {
        contact: true,
        agent: { select: { id: true, name: true, email: true } },
      },
    });

    this.realtimeGateway.emitConversationUpdated(updated.accountId, updated);
    return updated;
  }

  /**
   * Assign or unassign agent to conversation.
   */
  async assignAgent(
    id: string,
    agentUserId: string | null,
    accountId?: string,
  ) {
    const conv = await this.getConversation(id, accountId);

    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: { agentUserId: agentUserId || null },
      include: {
        contact: true,
        agent: { select: { id: true, name: true, email: true } },
      },
    });

    this.realtimeGateway.emitConversationUpdated(updated.accountId, updated);
    return updated;
  }

  /**
   * Mark all unread messages in conversation as read.
   */
  async markRead(id: string, accountId?: string) {
    const conv = await this.getConversation(id, accountId);

    const updated = await this.prisma.whatsAppConversation.update({
      where: { id: conv.id },
      data: { unreadCount: 0 },
      include: {
        contact: true,
        agent: { select: { id: true, name: true, email: true } },
      },
    });

    this.realtimeGateway.emitConversationUpdated(updated.accountId, updated);
    return updated;
  }
}
