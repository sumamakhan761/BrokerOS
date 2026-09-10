import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  AudienceEstimationResult,
  CampaignSenderPoolConfig,
} from '@brokeros/types';
import {
  PreviewAudienceDto,
  BulkAssignLeadsDto,
  ExportLeadsDto,
} from '../dto/email.dto.js';

@Injectable()
export class EmailAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  buildLeadWhereClause(
    filters: any = {},
    isCpCampaign?: boolean,
    projectId?: string,
  ) {
    const whereClause: any = {
      deletedAt: null,
      email: { not: null },
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
    dto: PreviewAudienceDto,
  ): Promise<AudienceEstimationResult> {
    const unsubscribedSet = new Set(
      (
        await this.prisma.marketingUnsubscribe.findMany({
          select: { email: true },
        })
      ).map((u) => u.email.toLowerCase().trim()),
    );

    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const seenEmails = new Set<string>();
      let duplicateCount = 0;
      let unsubscribedCount = 0;
      let validEmailCount = 0;

      for (const row of dto.csvRecipients) {
        const email = row.email?.toLowerCase().trim();
        if (!email || !emailRegex.test(email)) continue;

        if (seenEmails.has(email)) {
          duplicateCount++;
          continue;
        }
        seenEmails.add(email);

        if (unsubscribedSet.has(email)) {
          unsubscribedCount++;
          continue;
        }

        validEmailCount++;
      }

      return {
        totalCount: dto.csvRecipients.length,
        validEmailCount,
        duplicateCount,
        unsubscribedCount,
        finalAudienceCount: validEmailCount,
      };
    }

    const whereClause = this.buildLeadWhereClause(
      dto.audienceFilters,
      dto.isCpCampaign,
      dto.projectId,
    );
    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: { email: true },
    });

    const seenEmails = new Set<string>();
    let duplicateCount = 0;
    let unsubscribedCount = 0;
    let validEmailCount = 0;

    for (const lead of leads) {
      if (!lead.email) continue;
      const email = lead.email.toLowerCase().trim();

      if (seenEmails.has(email)) {
        duplicateCount++;
        continue;
      }
      seenEmails.add(email);

      if (unsubscribedSet.has(email)) {
        unsubscribedCount++;
        continue;
      }

      validEmailCount++;
    }

    return {
      totalCount: leads.length,
      validEmailCount,
      duplicateCount,
      unsubscribedCount,
      finalAudienceCount: validEmailCount,
    };
  }

  async getOrCreateDynamicLeadSource(campaignTitle: string) {
    const sourceName = `Email: ${campaignTitle.trim()}`.substring(0, 100);
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
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient) throw new NotFoundException('Recipient record not found');
    if (recipient.leadId) {
      const existing = await this.prisma.lead.findUnique({
        where: { id: recipient.leadId },
      });
      if (existing) return existing;
    }

    // Check if a Lead with same email or phone already exists
    const existingLead = await this.prisma.lead.findFirst({
      where: {
        OR: [
          ...(recipient.email ? [{ email: recipient.email }] : []),
          ...(recipient.phone && recipient.phone !== 'N/A'
            ? [{ phone: recipient.phone }]
            : []),
        ],
      },
    });

    if (existingLead) {
      await this.prisma.campaignRecipient.update({
        where: { id: recipientId },
        data: { leadId: existingLead.id },
      });
      return existingLead;
    }

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0] || 'Prospect';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};
    const source = await this.getOrCreateDynamicLeadSource(
      recipient.campaign.title,
    );

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        email: recipient.email,
        phone: recipient.phone || 'N/A',
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

    await this.prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }

  async bulkAssignRecipientsToCrm(dto: BulkAssignLeadsDto, userId?: string) {
    const where: any = {};
    if (dto.recipientIds?.length) {
      where.id = { in: dto.recipientIds };
    } else if (dto.campaignIds?.length) {
      where.campaignId = { in: dto.campaignIds };
    } else {
      throw new BadRequestException('Must provide campaignIds or recipientIds');
    }

    const recipients = await this.prisma.campaignRecipient.findMany({
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

    // Cache dynamic sources by campaign title
    const sourceCache = new Map<string, string>();
    const getSourceId = async (title: string) => {
      if (sourceCache.has(title)) return sourceCache.get(title)!;
      const s = await this.getOrCreateDynamicLeadSource(title);
      sourceCache.set(title, s.id);
      return s.id;
    };

    let newlyCreated = 0;
    let alreadyExisted = 0;

    // Collect all emails and phones to check existing in bulk
    const emails = recipients
      .map((r) => r.email?.toLowerCase().trim())
      .filter((e): e is string => Boolean(e));
    const phones = recipients
      .map((r) => r.phone?.trim())
      .filter((p): p is string => Boolean(p) && p !== 'N/A');

    const existingLeads = await this.prisma.lead.findMany({
      where: {
        OR: [
          ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
          ...(phones.length > 0 ? [{ phone: { in: phones } }] : []),
        ],
      },
      select: { id: true, email: true, phone: true },
    });

    const leadByEmail = new Map<string, string>();
    const leadByPhone = new Map<string, string>();
    for (const l of existingLeads) {
      if (l.email) leadByEmail.set(l.email.toLowerCase().trim(), l.id);
      if (l.phone && l.phone !== 'N/A') leadByPhone.set(l.phone.trim(), l.id);
    }

    // Process each recipient
    for (const recipient of recipients) {
      const email = recipient.email?.toLowerCase().trim();
      const phone = recipient.phone?.trim();

      const existingId =
        (email && leadByEmail.get(email)) ||
        (phone && phone !== 'N/A' && leadByPhone.get(phone));

      if (existingId) {
        if (recipient.leadId !== existingId) {
          await this.prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { leadId: existingId },
          });
        }
        alreadyExisted++;
        continue;
      }

      // Create new CRM Lead
      const nameParts = (recipient.name || 'Prospect').trim().split(' ');
      const firstName = nameParts[0] || 'Prospect';
      const lastName = nameParts.slice(1).join(' ') || undefined;
      const merge = (recipient.mergeData as any) || {};
      const sourceId = await getSourceId(recipient.campaign.title);

      const newLead = await this.prisma.lead.create({
        data: {
          firstName,
          lastName,
          email: recipient.email,
          phone: recipient.phone || 'N/A',
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

      if (email) leadByEmail.set(email, newLead.id);
      if (phone && phone !== 'N/A') leadByPhone.set(phone, newLead.id);

      await this.prisma.campaignRecipient.update({
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

  async getExportLeadsData(dto: ExportLeadsDto) {
    if (!dto.campaignIds || dto.campaignIds.length === 0) {
      throw new BadRequestException('At least one campaignId is required');
    }

    const recipients = await this.prisma.campaignRecipient.findMany({
      where: {
        campaignId: { in: dto.campaignIds },
      },
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
      email: r.email,
      phone: r.phone || '',
      status: r.status,
      campaignId: r.campaignId,
      campaignTitle: r.campaign?.title || 'Unknown Campaign',
      projectName: r.campaign?.project?.name || 'N/A',
      assignedProvider: r.assignedProvider || 'N/A',
      assignedSenderEmail: r.assignedSenderEmail || 'N/A',
      openCount: r.openCount || 0,
      clickCount: r.clickCount || 0,
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      firstOpenedAt: r.firstOpenedAt ? r.firstOpenedAt.toISOString() : null,
      firstClickedAt: r.firstClickedAt ? r.firstClickedAt.toISOString() : null,
      leadId: r.leadId,
    }));
  }

  partitionAudienceAcrossPools<T extends Record<string, any>>(
    recipients: T[],
    poolConfigs: CampaignSenderPoolConfig[],
    allocationMode: 'AUTO_EVEN' | 'CUSTOM_PERCENTAGE' = 'AUTO_EVEN',
  ): {
    partitionedRecipients: Array<
      T & {
        senderDomainId?: string;
        assignedSenderEmail?: string;
        assignedProvider?: string;
        poolIndex?: number;
      }
    >;
    allocations: Array<{
      senderDomainId?: string;
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

    // Calculate normalized weights (sum to 1)
    let weights: number[] = [];
    if (allocationMode === 'AUTO_EVEN') {
      weights = poolConfigs.map(() => 1 / n);
    } else {
      const rawSum = poolConfigs.reduce((acc, p) => acc + (p.weight || 0), 0);
      if (rawSum <= 0) {
        weights = poolConfigs.map(() => 1 / n);
      } else {
        weights = poolConfigs.map((p) => (p.weight || 0) / rawSum);
      }
    }

    // Determine target counts per pool
    const targetCounts = weights.map((w) => Math.floor(total * w));
    const allocatedSum = targetCounts.reduce((acc, c) => acc + c, 0);
    const remainder = total - allocatedSum;

    // Distribute remainder by highest fractional parts
    const remainders = weights.map((w, idx) => ({
      idx,
      fractional: total * w - targetCounts[idx],
    }));
    remainders.sort((a, b) => b.fractional - a.fractional);

    for (let i = 0; i < remainder; i++) {
      targetCounts[remainders[i].idx]++;
    }

    // Partition recipients
    const partitionedRecipients: Array<
      T & {
        senderDomainId?: string;
        assignedSenderEmail?: string;
        assignedProvider?: string;
        poolIndex?: number;
      }
    > = [];

    const allocations: Array<{
      senderDomainId?: string;
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
          senderDomainId: pool.senderDomainId,
          assignedSenderEmail: pool.fromEmail,
          assignedProvider: pool.provider,
          poolIndex: i,
        });
      }

      allocations.push({
        senderDomainId: pool.senderDomainId,
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
