// ============================================================================
// BrokerOS — WhatsApp Broadcasts Service
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
  CreateWhatsAppBroadcastDto,
  ListWhatsAppBroadcastsQueryDto,
  ScheduleWhatsAppBroadcastDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppBroadcastsService {
  private readonly logger = new Logger(WhatsAppBroadcastsService.name);
  private readonly prisma = prismaClient;

  /**
   * Create a new broadcast campaign and prepare its recipient list.
   */
  async createBroadcast(dto: CreateWhatsAppBroadcastDto, userId?: string) {
    // 1. Resolve active WhatsApp business account
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

    // 2. Resolve Recipients
    const recipientsToCreate: Array<{
      contactId: string;
      phone: string;
      parameters?: any;
    }> = [];

    // Path A: Existing contacts
    if (dto.contactIds && dto.contactIds.length > 0) {
      const contacts = await this.prisma.whatsAppContact.findMany({
        where: {
          id: { in: dto.contactIds },
          accountId,
          deletedAt: null,
        },
        select: { id: true, phone: true },
      });

      for (const contact of contacts) {
        if (!contact.phone) continue;
        recipientsToCreate.push({
          contactId: contact.id,
          phone: contact.phone,
        });
      }
    }

    // Path B: CSV lead rows (inline upsert)
    if (dto.csvRows && dto.csvRows.length > 0) {
      for (const row of dto.csvRows) {
        const cleanPhone = sanitizePhoneForMeta(row.phone);
        if (!cleanPhone || !isValidE164(cleanPhone)) continue;

        const contact = await this.prisma.whatsAppContact.upsert({
          where: {
            accountId_phone: { accountId, phone: cleanPhone },
          },
          create: {
            accountId,
            phone: cleanPhone,
            name: row.name || null,
          },
          update: {
            name: row.name || undefined,
            deletedAt: null,
          },
          select: { id: true },
        });

        recipientsToCreate.push({
          contactId: contact.id,
          phone: cleanPhone,
          parameters: row.params ? (row.params as any) : undefined,
        });
      }
    }

    // Path C: Explicit recipients list from frontend wizard
    if (dto.recipients && dto.recipients.length > 0) {
      for (const r of dto.recipients) {
        const cleanPhone = sanitizePhoneForMeta(r.phone);
        if (!cleanPhone) continue;

        let contactId = r.contactId;
        if (!contactId) {
          const contact = await this.prisma.whatsAppContact.upsert({
            where: { accountId_phone: { accountId, phone: cleanPhone } },
            create: { accountId, phone: cleanPhone },
            update: { deletedAt: null },
            select: { id: true },
          });
          contactId = contact.id;
        }

        recipientsToCreate.push({
          contactId,
          phone: cleanPhone,
          parameters: r.parameters ? (r.parameters as any) : undefined,
        });
      }
    }

    // Path D: CRM Leads segmentation (filtered by project, temperature, status, budget)
    if (dto.crmFilter || dto.audienceType === 'crm_filter') {
      const filters = dto.crmFilter || {};
      const whereClause: any = {
        deletedAt: null,
        phone: { not: '' },
      };

      if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
        whereClause.status = { in: filters.statuses };
      } else {
        whereClause.status = {
          in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'],
        };
      }

      if (filters.temperatures?.length) {
        whereClause.temperature = { in: filters.temperatures };
      }

      if (filters.projectId && filters.projectId !== 'ALL') {
        whereClause.interestedProjectId = filters.projectId;
      }

      if (filters.minBudget) {
        whereClause.budget = { gte: Number(filters.minBudget) };
      }

      const leads = await this.prisma.lead.findMany({
        where: whereClause,
        select: { id: true, firstName: true, lastName: true, phone: true },
        take: 10000,
      });

      for (const lead of leads) {
        const cleanPhone = sanitizePhoneForMeta(lead.phone);
        if (!cleanPhone || !isValidE164(cleanPhone)) continue;

        const fullName = [lead.firstName, lead.lastName]
          .filter(Boolean)
          .join(' ');

        const contact = await this.prisma.whatsAppContact.upsert({
          where: { accountId_phone: { accountId, phone: cleanPhone } },
          create: {
            accountId,
            phone: cleanPhone,
            name: fullName || null,
            leadId: lead.id,
          },
          update: {
            name: fullName || undefined,
            leadId: lead.id,
            deletedAt: null,
          },
          select: { id: true },
        });

        recipientsToCreate.push({
          contactId: contact.id,
          phone: cleanPhone,
        });
      }
    }

    // Deduplicate by phone
    const uniqueRecipients = Array.from(
      new Map(recipientsToCreate.map((r) => [r.phone, r])).values(),
    );

    if (uniqueRecipients.length === 0) {
      throw new BadRequestException(
        'At least one valid recipient phone number or contact is required',
      );
    }

    const scheduledDate = dto.scheduledAt ? new Date(dto.scheduledAt) : new Date();
    const initialStatus = 'SCHEDULED' as const;

    // 3. Atomically persist Broadcast and child Recipients
    return this.prisma.$transaction(async (tx) => {
      const broadcast = await tx.whatsAppBroadcast.create({
        data: {
          accountId,
          createdById: userId || null,
          name: dto.name.trim(),
          templateName: dto.templateName.trim(),
          templateLanguage: dto.templateLanguage || 'en_US',
          status: initialStatus,
          scheduledAt: scheduledDate,
          totalRecipients: uniqueRecipients.length,
          sentCount: 0,
          deliveredCount: 0,
          readCount: 0,
          failedCount: 0,
        },
      });

      await tx.whatsAppBroadcastRecipient.createMany({
        data: uniqueRecipients.map((r) => ({
          broadcastId: broadcast.id,
          contactId: r.contactId,
          phone: r.phone,
          status: 'PENDING',
          templateParams: r.parameters ? r.parameters : undefined,
        })),
      });

      return broadcast;
    });
  }

  /**
   * List paginated broadcasts for an account.
   */
  async listBroadcasts(
    query: ListWhatsAppBroadcastsQueryDto,
    scopedAccountId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;
    const where: Record<string, any> = {};

    if (accountId) where.accountId = accountId;
    if (query.status) where.status = query.status.toUpperCase();
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.whatsAppBroadcast.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppBroadcast.count({ where }),
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
   * Get single broadcast summary with stats.
   */
  async getBroadcast(id: string, scopedAccountId?: string) {
    const where: Record<string, any> = { id };
    if (scopedAccountId) where.accountId = scopedAccountId;

    const broadcast = await this.prisma.whatsAppBroadcast.findFirst({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast ${id} not found`);
    }

    return broadcast;
  }

  /**
   * Get paginated recipients for a specific broadcast.
   */
  async getRecipients(
    broadcastId: string,
    query: { status?: string; page?: number | string; limit?: number | string },
    scopedAccountId?: string,
  ) {
    await this.getBroadcast(broadcastId, scopedAccountId);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { broadcastId };
    if (query.status) where.status = query.status.toUpperCase();

    const [items, total] = await Promise.all([
      this.prisma.whatsAppBroadcastRecipient.findMany({
        where,
        include: {
          contact: true,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppBroadcastRecipient.count({ where }),
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
   * Schedule broadcast execution for a future date/time.
   */
  async scheduleBroadcast(
    id: string,
    dto: ScheduleWhatsAppBroadcastDto,
    scopedAccountId?: string,
  ) {
    const broadcast = await this.getBroadcast(id, scopedAccountId);

    if (broadcast.status === 'SENDING' || broadcast.status === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot schedule broadcast that is already in status ${broadcast.status}`,
      );
    }

    const scheduledDate = dto.scheduledAt
      ? new Date(dto.scheduledAt)
      : new Date();

    return this.prisma.whatsAppBroadcast.update({
      where: { id: broadcast.id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduledDate,
      },
    });
  }

  /**
   * Immediate dispatch trigger: marks broadcast SCHEDULED right now.
   */
  async dispatchNow(id: string, scopedAccountId?: string) {
    return this.scheduleBroadcast(
      id,
      { scheduledAt: new Date().toISOString() },
      scopedAccountId,
    );
  }

  /**
   * Cancel a scheduled broadcast.
   */
  async cancelBroadcast(id: string, scopedAccountId?: string) {
    const broadcast = await this.getBroadcast(id, scopedAccountId);

    if (broadcast.status === 'SENDING' || broadcast.status === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot cancel broadcast in status ${broadcast.status}`,
      );
    }

    return this.prisma.whatsAppBroadcast.update({
      where: { id: broadcast.id },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Delete a broadcast.
   */
  async deleteBroadcast(id: string, scopedAccountId?: string) {
    const broadcast = await this.getBroadcast(id, scopedAccountId);

    if (broadcast.status === 'SENDING') {
      throw new BadRequestException(
        'Cannot delete an active broadcast currently sending',
      );
    }

    await this.prisma.whatsAppBroadcast.delete({
      where: { id: broadcast.id },
    });

    return { success: true, message: 'Broadcast deleted' };
  }

  /**
   * Get active projects for CRM audience filtering.
   */
  async getProjects() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Estimate audience reach based on CRM filters or CSV upload.
   */
  async previewAudience(dto: {
    audienceSource?: string;
    audienceFilters?: any;
    csvRecipients?: any[];
  }) {
    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const seen = new Set<string>();
      let valid = 0;
      let dupes = 0;
      for (const row of dto.csvRecipients) {
        const clean = sanitizePhoneForMeta(row.phone || '');
        if (!clean) continue;
        if (seen.has(clean)) {
          dupes++;
        } else {
          seen.add(clean);
          valid++;
        }
      }
      return {
        totalCount: dto.csvRecipients.length,
        validPhoneCount: valid,
        duplicateCount: dupes,
        finalAudienceCount: valid,
      };
    }

    const filters = dto.audienceFilters || {};
    const whereClause: any = {
      deletedAt: null,
      phone: { not: '' },
    };

    if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
      whereClause.status = { in: filters.statuses };
    } else {
      whereClause.status = {
        in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'],
      };
    }

    if (filters.temperatures?.length) {
      whereClause.temperature = { in: filters.temperatures };
    }

    if (filters.projectId && filters.projectId !== 'ALL') {
      whereClause.interestedProjectId = filters.projectId;
    }

    if (filters.minBudget) {
      whereClause.budget = { gte: Number(filters.minBudget) };
    }

    const totalCount = await this.prisma.lead.count({ where: whereClause });

    return {
      totalCount,
      validPhoneCount: totalCount,
      duplicateCount: 0,
      finalAudienceCount: totalCount,
    };
  }
}
