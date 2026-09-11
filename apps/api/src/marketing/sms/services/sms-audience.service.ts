import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  CampaignSmsSenderPoolConfig,
  SmsAudienceEstimationResult,
} from '@brokeros/types';
import {
  PreviewSmsAudienceDto,
  BulkAssignSmsLeadsDto,
  ExportSmsLeadsDto,
} from '../dto/sms.dto.js';

@Injectable()
export class SmsAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  buildLeadWhereClause(
    filters: any = {},
    isCpCampaign?: boolean,
    projectId?: string,
  ) {
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

    const targetProject = filters.projectId || projectId;
    if (targetProject && targetProject !== 'ALL' && targetProject !== '') {
      whereClause.interestedProjectId = targetProject;
    }

    if (filters.minBudget) {
      whereClause.budget = { gte: Number(filters.minBudget) };
    }

    if (isCpCampaign) {
      whereClause.brokerId = { not: null };
    }

    return whereClause;
  }

  async previewAudience(
    dto: PreviewSmsAudienceDto,
  ): Promise<SmsAudienceEstimationResult> {
    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const seenPhones = new Set<string>();
      let validPhoneCount = 0;
      let duplicateCount = 0;

      for (const row of dto.csvRecipients) {
        const phone = row.phone?.replace(/[^\d+]/g, '');
        if (!phone || phone.length < 8) continue;

        if (seenPhones.has(phone)) {
          duplicateCount++;
          continue;
        }
        seenPhones.add(phone);
        validPhoneCount++;
      }

      return {
        totalCount: dto.csvRecipients.length,
        validPhoneCount,
        duplicateCount,
        finalAudienceCount: validPhoneCount,
      };
    }

    const whereClause = this.buildLeadWhereClause(
      dto.audienceFilters,
      dto.isCpCampaign,
      dto.projectId,
    );
    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: { phone: true },
    });

    const seenPhones = new Set<string>();
    let duplicateCount = 0;
    let validPhoneCount = 0;

    for (const lead of leads) {
      if (!lead.phone) continue;
      const phone = lead.phone.replace(/[^\d+]/g, '');
      if (phone.length < 8) continue;

      if (seenPhones.has(phone)) {
        duplicateCount++;
        continue;
      }
      seenPhones.add(phone);
      validPhoneCount++;
    }

    return {
      totalCount: leads.length,
      validPhoneCount,
      duplicateCount,
      finalAudienceCount: validPhoneCount,
    };
  }

  async getOrCreateDynamicLeadSource(campaignTitle: string) {
    const sourceName = `SMS: ${campaignTitle.trim()}`.substring(0, 100);
    return this.prisma.leadSource.upsert({
      where: { name: sourceName },
      create: {
        name: sourceName,
        type: 'MARKETING_CAMPAIGN',
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });
  }

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    const recipient = await this.prisma.smsRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient) {
      throw new NotFoundException('SMS Recipient record not found');
    }

    if (recipient.leadId) {
      const existing = await this.prisma.lead.findUnique({
        where: { id: recipient.leadId },
      });
      if (existing) return existing;
    }

    const existingLead = await this.prisma.lead.findFirst({
      where: {
        phone: recipient.phone,
      },
    });

    if (existingLead) {
      await this.prisma.smsRecipient.update({
        where: { id: recipientId },
        data: { leadId: existingLead.id },
      });
      return existingLead;
    }

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0] || 'Prospect';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};
    const source = await this.getOrCreateDynamicLeadSource(recipient.campaign.title);

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        phone: recipient.phone,
        temperature: merge.temperature || 'HOT',
        status: 'NEW',
        subStatus: 'PENDING',
        interestedProjectId: recipient.campaign.projectId,
        sourceId: source.id,
        budget: merge.budget ? Number(merge.budget) : null,
        assignedUserId: null, // Routing directly to Pre-Sales Manager unassigned intake queue
        createdById: userId,
      },
    });

    await this.prisma.smsRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }

  async bulkAssignRecipientsToCrm(dto: BulkAssignSmsLeadsDto, userId?: string) {
    const where: any = {};
    if (dto.recipientIds?.length) {
      where.id = { in: dto.recipientIds };
    } else if (dto.campaignIds?.length) {
      where.campaignId = { in: dto.campaignIds };
    } else {
      throw new BadRequestException('Must provide campaignIds or recipientIds');
    }

    const recipients = await this.prisma.smsRecipient.findMany({
      where,
      include: {
        campaign: true,
      },
    });

    if (recipients.length === 0) {
      return {
        success: true,
        totalProcessed: 0,
        newlyCreated: 0,
        alreadyExisted: 0,
      };
    }

    const sourceCache = new Map<string, string>();
    const getSourceId = async (title: string) => {
      if (sourceCache.has(title)) return sourceCache.get(title)!;
      const s = await this.getOrCreateDynamicLeadSource(title);
      sourceCache.set(title, s.id);
      return s.id;
    };

    let newlyCreated = 0;
    let alreadyExisted = 0;

    const phones = recipients
      .map((r) => r.phone?.trim())
      .filter((p): p is string => Boolean(p) && p !== 'N/A');

    const existingLeads = await this.prisma.lead.findMany({
      where: {
        phone: { in: phones },
      },
      select: { id: true, phone: true },
    });

    const leadByPhone = new Map<string, string>();
    for (const l of existingLeads) {
      if (l.phone) leadByPhone.set(l.phone.trim(), l.id);
    }

    for (const recipient of recipients) {
      const phone = recipient.phone?.trim();
      const existingId = phone && leadByPhone.get(phone);

      if (existingId) {
        if (recipient.leadId !== existingId) {
          await this.prisma.smsRecipient.update({
            where: { id: recipient.id },
            data: { leadId: existingId },
          });
        }
        alreadyExisted++;
        continue;
      }

      const nameParts = (recipient.name || 'Prospect').trim().split(' ');
      const firstName = nameParts[0] || 'Prospect';
      const lastName = nameParts.slice(1).join(' ') || undefined;
      const merge = (recipient.mergeData as any) || {};
      const sourceId = await getSourceId(recipient.campaign.title);

      const newLead = await this.prisma.lead.create({
        data: {
          firstName,
          lastName,
          phone: recipient.phone,
          temperature: merge.temperature || 'HOT',
          status: 'NEW',
          subStatus: 'PENDING',
          interestedProjectId: recipient.campaign.projectId,
          sourceId,
          budget: merge.budget ? Number(merge.budget) : null,
          assignedUserId: null, // Routing directly to Pre-Sales Manager unassigned intake queue
          createdById: userId,
        },
      });

      if (phone) leadByPhone.set(phone, newLead.id);

      await this.prisma.smsRecipient.update({
        where: { id: recipient.id },
        data: { leadId: newLead.id },
      });

      newlyCreated++;
    }

    return {
      success: true,
      totalProcessed: recipients.length,
      newlyCreated,
      alreadyExisted,
    };
  }

  async getExportLeadsData(dto: ExportSmsLeadsDto) {
    const where: any = {};
    if (dto.recipientIds && dto.recipientIds.length > 0) {
      where.id = { in: dto.recipientIds };
    } else if (dto.campaignIds && dto.campaignIds.length > 0) {
      where.campaignId = { in: dto.campaignIds };
    } else {
      throw new BadRequestException('At least one campaignId or recipientId is required');
    }

    const recipients = await this.prisma.smsRecipient.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return recipients.map((r) => ({
      id: r.id,
      name: r.name || 'Prospect',
      phone: r.phone,
      status: r.status,
      campaignId: r.campaignId,
      campaignTitle: r.campaign?.title || 'Unknown Campaign',
      projectName: r.campaign?.project?.name || 'N/A',
      assignedProvider: r.assignedProvider || 'N/A',
      assignedSenderPhone: r.assignedSenderPhone || 'N/A',
      clickCount: r.clickCount || 0,
      segmentsCount: r.segmentsCount || 1,
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      deliveredAt: r.deliveredAt ? r.deliveredAt.toISOString() : null,
      firstClickedAt: r.firstClickedAt ? r.firstClickedAt.toISOString() : null,
      leadId: r.leadId,
    }));
  }

  partitionAudienceAcrossPools<T extends Record<string, any>>(
    recipients: T[],
    poolConfigs: CampaignSmsSenderPoolConfig[],
    allocationMode: 'AUTO_EVEN' | 'CUSTOM_PERCENTAGE' = 'AUTO_EVEN',
  ): {
    partitionedRecipients: Array<
      T & {
        senderNumberId?: string;
        assignedSenderPhone?: string;
        assignedProvider?: string;
        poolIndex?: number;
      }
    >;
    allocations: Array<{
      senderNumberId?: string;
      weight: number;
      count: number;
    }>;
  } {
    const total = recipients.length;
    if (total === 0 || !poolConfigs || poolConfigs.length === 0) {
      return {
        partitionedRecipients: recipients,
        allocations: [],
      };
    }

    const n = poolConfigs.length;

    let weights: number[] = [];
    if (allocationMode === 'AUTO_EVEN') {
      weights = poolConfigs.map(() => 1 / n);
    } else {
      const rawSum = poolConfigs.reduce(
        (acc, p) => acc + (p.allocationPercentage || p.weight || 0),
        0,
      );
      if (rawSum <= 0) {
        weights = poolConfigs.map(() => 1 / n);
      } else {
        weights = poolConfigs.map(
          (p) => (p.allocationPercentage || p.weight || 0) / rawSum,
        );
      }
    }

    const targetCounts = weights.map((w) => Math.floor(total * w));
    const allocatedSum = targetCounts.reduce((acc, c) => acc + c, 0);
    const remainder = total - allocatedSum;

    const remainders = weights.map((w, idx) => ({
      idx,
      fractional: total * w - targetCounts[idx],
    }));
    remainders.sort((a, b) => b.fractional - a.fractional);

    for (let i = 0; i < remainder; i++) {
      targetCounts[remainders[i].idx]++;
    }

    const partitionedRecipients: Array<
      T & {
        senderNumberId?: string;
        assignedSenderPhone?: string;
        assignedProvider?: string;
        poolIndex?: number;
      }
    > = [];

    const allocations: Array<{
      senderNumberId?: string;
      weight: number;
      count: number;
    }> = [];

    let cursor = 0;
    for (let i = 0; i < n; i++) {
      const pool = poolConfigs[i];
      const count = targetCounts[i];
      const poolRecipients = recipients.slice(cursor, cursor + count);
      cursor += count;

      for (const recipient of poolRecipients) {
        partitionedRecipients.push({
          ...recipient,
          senderNumberId: pool.senderNumberId,
          assignedSenderPhone: pool.phoneNumber || pool.senderId,
          assignedProvider: pool.provider,
          poolIndex: i,
        });
      }

      allocations.push({
        senderNumberId: pool.senderNumberId,
        weight: Number(weights[i].toFixed(4)),
        count,
      });
    }

    return {
      partitionedRecipients,
      allocations,
    };
  }
}
