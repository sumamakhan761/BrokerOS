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
import { PreviewAudienceDto } from '../dto/email.dto.js';

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

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient) throw new NotFoundException('Recipient record not found');
    if (recipient.leadId)
      throw new BadRequestException(
        'Recipient is already linked to a CRM Lead',
      );

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        email: recipient.email,
        phone: recipient.phone || 'N/A',
        temperature: merge.temperature || 'HOT',
        status: 'INTERESTED',
        interestedProjectId: recipient.campaign.projectId,
        budget: merge.budget ? Number(merge.budget) : null,
        createdById: userId,
      },
    });

    await this.prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
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
