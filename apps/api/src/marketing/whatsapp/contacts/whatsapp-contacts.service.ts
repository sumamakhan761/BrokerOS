// ============================================================================
// BrokerOS — WhatsApp Contacts Service (Modular Coordinator)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { sanitizePhoneForMeta, isValidE164 } from '@brokeros/int-whatsapp';
import type {
  CreateWhatsAppContactDto,
  UpdateWhatsAppContactDto,
  ListWhatsAppContactsQueryDto,
  CreateWhatsAppTagDto,
  CreateWhatsAppQuickReplyDto,
  UpdateWhatsAppQuickReplyDto,
} from '../dto/whatsapp.dto.js';
import { WhatsAppTagsService } from './whatsapp-tags.service.js';
import { WhatsAppQuickRepliesService } from './whatsapp-quick-replies.service.js';

@Injectable()
export class WhatsAppContactsService {
  private readonly logger = new Logger(WhatsAppContactsService.name);
  private readonly prisma = prismaClient;

  constructor(
    private readonly tagsService: WhatsAppTagsService,
    private readonly quickRepliesService: WhatsAppQuickRepliesService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. Contacts
  // ─────────────────────────────────────────────

  async listContacts(
    query: ListWhatsAppContactsQueryDto,
    scopedAccountId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;

    const where: Record<string, any> = {
      deletedAt: null,
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (query.tagId) {
      where.tags = {
        some: { tagId: query.tagId },
      };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { phone: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.whatsAppContact.findMany({
        where,
        include: {
          tags: {
            include: { tag: true },
          },
          lead: {
            select: { id: true, firstName: true, lastName: true, status: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppContact.count({ where }),
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

  async getContact(id: string) {
    const contact = await this.prisma.whatsAppContact.findFirst({
      where: { id, deletedAt: null },
      include: {
        tags: {
          include: { tag: true },
        },
        lead: true,
        conversations: {
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
        },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        customValues: {
          include: { field: true },
        },
        deals: {
          include: { stage: true, pipeline: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    return contact;
  }

  async createContact(dto: CreateWhatsAppContactDto) {
    const cleanPhone = sanitizePhoneForMeta(dto.phone);
    if (!cleanPhone || !isValidE164(cleanPhone)) {
      throw new BadRequestException('Valid E.164 phone number required');
    }

    let accountId = dto.accountId;
    if (!accountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      if (!defaultAccount) {
        throw new BadRequestException(
          'No active WhatsApp business account found',
        );
      }
      accountId = defaultAccount.id;
    }

    const contact = await this.prisma.whatsAppContact.upsert({
      where: {
        accountId_phone: { accountId, phone: cleanPhone },
      },
      create: {
        accountId,
        phone: cleanPhone,
        name: dto.name || null,
        email: dto.email || null,
        company: dto.company || null,
        leadId: dto.leadId || null,
      },
      update: {
        name: dto.name !== undefined ? dto.name : undefined,
        email: dto.email !== undefined ? dto.email : undefined,
        company: dto.company !== undefined ? dto.company : undefined,
        leadId: dto.leadId !== undefined ? dto.leadId : undefined,
        deletedAt: null,
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    try {
      const existingConv = await this.prisma.whatsAppConversation.findFirst({
        where: {
          accountId: contact.accountId,
          contactId: contact.id,
          isActive: true,
        },
      });

      if (!existingConv) {
        await this.prisma.whatsAppConversation.create({
          data: {
            accountId: contact.accountId,
            contactId: contact.id,
            contactPhone: contact.phone,
            contactName: contact.name,
            leadId: contact.leadId,
            status: 'open',
            isActive: true,
          },
        });
      }
    } catch (convErr: any) {
      this.logger.warn(
        `Failed to auto-create conversation for contact ${contact.id}: ${convErr?.message}`,
      );
    }

    return contact;
  }

  async updateContact(id: string, dto: UpdateWhatsAppContactDto) {
    const existing = await this.prisma.whatsAppContact.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    return this.prisma.whatsAppContact.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        email: dto.email !== undefined ? dto.email : undefined,
        company: dto.company !== undefined ? dto.company : undefined,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
        leadId: dto.leadId !== undefined ? dto.leadId : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        lead: true,
      },
    });
  }

  async deleteContact(id: string) {
    const existing = await this.prisma.whatsAppContact.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    await this.prisma.whatsAppContact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Contact deleted' };
  }

  async linkToLead(contactId: string, leadId: string | null) {
    return this.updateContact(contactId, { leadId });
  }

  // ─────────────────────────────────────────────
  // 2. Tags (Delegated to WhatsAppTagsService)
  // ─────────────────────────────────────────────

  async listTags(accountId?: string) {
    return this.tagsService.listTags(accountId);
  }

  async createTag(dto: CreateWhatsAppTagDto) {
    return this.tagsService.createTag(dto);
  }

  async deleteTag(id: string) {
    return this.tagsService.deleteTag(id);
  }

  async addTag(contactId: string, tagId: string) {
    return this.tagsService.addTag(contactId, tagId);
  }

  async removeTag(contactId: string, tagId: string) {
    return this.tagsService.removeTag(contactId, tagId);
  }

  // ─────────────────────────────────────────────
  // 3. Quick Replies (Delegated to WhatsAppQuickRepliesService)
  // ─────────────────────────────────────────────

  async listQuickReplies(accountId?: string) {
    return this.quickRepliesService.listQuickReplies(accountId);
  }

  async createQuickReply(dto: CreateWhatsAppQuickReplyDto) {
    return this.quickRepliesService.createQuickReply(dto);
  }

  async updateQuickReply(id: string, dto: UpdateWhatsAppQuickReplyDto) {
    return this.quickRepliesService.updateQuickReply(id, dto);
  }

  async deleteQuickReply(id: string) {
    return this.quickRepliesService.deleteQuickReply(id);
  }

  // ─────────────────────────────────────────────
  // 4. Contact Notes
  // ─────────────────────────────────────────────

  async listNotes(contactId: string) {
    return this.prisma.whatsAppContactNote.findMany({
      where: { contactId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(contactId: string, content: string, authorId?: string) {
    const contact = await this.prisma.whatsAppContact.findUnique({
      where: { id: contactId },
    });
    if (!contact) throw new NotFoundException(`Contact ${contactId} not found`);

    return this.prisma.whatsAppContactNote.create({
      data: {
        contactId,
        content: content.trim(),
        authorId: authorId || null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteNote(noteId: string) {
    await this.prisma.whatsAppContactNote.delete({
      where: { id: noteId },
    });
    return { success: true, message: 'Note deleted' };
  }

  // ─────────────────────────────────────────────
  // 5. Custom Fields & Contact Values
  // ─────────────────────────────────────────────

  async listCustomFields(accountId?: string) {
    let targetAccountId = accountId;
    if (!targetAccountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      targetAccountId = defaultAccount?.id;
    }
    if (!targetAccountId) return [];

    return this.prisma.whatsAppCustomField.findMany({
      where: { accountId: targetAccountId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCustomField(dto: {
    name: string;
    type?: string;
    options?: any;
    accountId?: string;
  }) {
    let accountId = dto.accountId;
    if (!accountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      if (!defaultAccount) {
        throw new BadRequestException('No active account found');
      }
      accountId = defaultAccount.id;
    }

    return this.prisma.whatsAppCustomField.upsert({
      where: {
        accountId_name: { accountId, name: dto.name.trim() },
      },
      create: {
        accountId,
        name: dto.name.trim(),
        type: dto.type || 'text',
        options: dto.options || undefined,
      },
      update: {
        type: dto.type || undefined,
        options: dto.options || undefined,
      },
    });
  }

  async saveContactCustomValues(
    contactId: string,
    values: Record<string, string>,
  ) {
    const contact = await this.prisma.whatsAppContact.findUnique({
      where: { id: contactId },
    });
    if (!contact) throw new NotFoundException(`Contact ${contactId} not found`);

    const operations = Object.entries(values).map(([fieldId, value]) =>
      this.prisma.whatsAppContactCustomValue.upsert({
        where: {
          contactId_fieldId: { contactId, fieldId },
        },
        create: {
          contactId,
          fieldId,
          value: String(value || ''),
        },
        update: {
          value: String(value || ''),
        },
      }),
    );

    await this.prisma.$transaction(operations);
    return { success: true, count: operations.length };
  }

  // ─────────────────────────────────────────────
  // 6. Bulk Contact CSV Importer
  // ─────────────────────────────────────────────

  async bulkImportContacts(
    contacts: Array<{
      phone: string;
      name?: string;
      email?: string;
      company?: string;
      tags?: string[];
    }>,
    accountId?: string,
  ) {
    let targetAccountId = accountId;
    if (!targetAccountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      if (!defaultAccount) {
        throw new BadRequestException(
          'No active WhatsApp business account found',
        );
      }
      targetAccountId = defaultAccount.id;
    }

    let createdCount = 0;

    for (const item of contacts) {
      if (!item.phone) continue;
      const cleanPhone = sanitizePhoneForMeta(item.phone);
      if (!isValidE164(cleanPhone)) continue;

      const contact = await this.prisma.whatsAppContact.upsert({
        where: {
          accountId_phone: { accountId: targetAccountId, phone: cleanPhone },
        },
        create: {
          accountId: targetAccountId,
          phone: cleanPhone,
          name: item.name || null,
          email: item.email || null,
          company: item.company || null,
        },
        update: {
          name: item.name !== undefined ? item.name : undefined,
          email: item.email !== undefined ? item.email : undefined,
          company: item.company !== undefined ? item.company : undefined,
          deletedAt: null,
        },
      });

      if (item.tags && item.tags.length > 0) {
        for (const tagName of item.tags) {
          if (!tagName.trim()) continue;
          const tag = await this.prisma.whatsAppTag.upsert({
            where: {
              accountId_name: {
                accountId: targetAccountId,
                name: tagName.trim(),
              },
            },
            create: {
              accountId: targetAccountId,
              name: tagName.trim(),
            },
            update: {},
          });

          await this.prisma.whatsAppContactTag.upsert({
            where: {
              contactId_tagId: { contactId: contact.id, tagId: tag.id },
            },
            create: {
              contactId: contact.id,
              tagId: tag.id,
            },
            update: {},
          });
        }
      }

      createdCount++;
    }

    return {
      imported: createdCount,
      totalSubmitted: contacts.length,
    };
  }
}
