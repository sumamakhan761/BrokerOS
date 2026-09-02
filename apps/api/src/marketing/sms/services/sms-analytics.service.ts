import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { SmsCampaignAnalyticsSummary } from '@brokeros/types';

@Injectable()
export class SmsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignAnalytics(
    campaignId: string,
  ): Promise<SmsCampaignAnalyticsSummary> {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('SMS Campaign not found');

    const [
      totalRecipientsCount,
      deliveredCount,
      clickedCount,
      failedCount,
      shortLinks,
    ] = await Promise.all([
      this.prisma.smsRecipient.count({ where: { campaignId } }),
      this.prisma.smsRecipient.count({
        where: { campaignId, status: 'DELIVERED' },
      }),
      this.prisma.smsRecipient.count({
        where: { campaignId, clickCount: { gt: 0 } },
      }),
      this.prisma.smsRecipient.count({
        where: { campaignId, status: 'FAILED' },
      }),
      this.prisma.smsShortLink.findMany({
        where: { campaignId },
        select: { destinationUrl: true, clicksCount: true },
      }),
    ]);

    const sentCount = Math.max(
      campaign.sentCount,
      deliveredCount + failedCount,
    );
    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const clickRate =
      deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;

    const linkMap: Record<string, number> = {};
    for (const link of shortLinks) {
      if (link.destinationUrl) {
        linkMap[link.destinationUrl] =
          (linkMap[link.destinationUrl] || 0) + (link.clicksCount || 0);
      }
    }

    const topClickedLinks = Object.entries(linkMap)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status,
      providerType: campaign.providerType,
      fromSender: campaign.fromSender,
      totalRecipients: Math.max(campaign.totalRecipients, totalRecipientsCount),
      sentCount,
      deliveredCount,
      deliveryRate: Number(deliveryRate.toFixed(1)),
      clickedCount,
      clickRate: Number(clickRate.toFixed(1)),
      failedCount,
      totalSegmentsSent: campaign.totalSegmentsSent,
      topClickedLinks,
    };
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 25;
    const skip = (page - 1) * limit;

    const where: any = { campaignId };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { phone: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.smsRecipient.count({ where }),
      this.prisma.smsRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ clickCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              temperature: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
