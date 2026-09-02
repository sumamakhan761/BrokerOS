import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { SmsAudienceEstimationResult } from '@brokeros/types';
import { PreviewSmsAudienceDto } from '../dto/sms.dto.js';

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

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    const recipient = await this.prisma.smsRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient)
      throw new NotFoundException('SMS Recipient record not found');
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
        phone: recipient.phone,
        temperature: merge.temperature || 'HOT',
        status: 'INTERESTED',
        interestedProjectId: recipient.campaign.projectId,
        budget: merge.budget ? Number(merge.budget) : null,
        createdById: userId,
      },
    });

    await this.prisma.smsRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }
}
