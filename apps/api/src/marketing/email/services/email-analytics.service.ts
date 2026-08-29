import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { CampaignAnalyticsSummary } from '@brokeros/types';

@Injectable()
export class EmailAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalyticsSummary> {
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const [
      totalRecipientsCount,
      deliveredRecipients,
      openedRecipients,
      clickedRecipients,
      bouncedRecipients,
    ] = await Promise.all([
      this.prisma.campaignRecipient.count({ where: { campaignId } }),
      this.prisma.campaignRecipient.count({
        where: { campaignId, status: { in: ['DELIVERED', 'OPENED', 'CLICKED', 'SENT'] } },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [
            { status: { in: ['OPENED', 'CLICKED'] } },
            { openCount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [
            { status: 'CLICKED' },
            { clickCount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: { campaignId, status: { in: ['BOUNCED', 'FAILED'] } },
      }),
    ]);

    const sentCount = Math.max(campaign.sentCount, deliveredRecipients + bouncedRecipients);
    const deliveredCount = Math.max(campaign.deliveredCount, deliveredRecipients);
    const openedCount = Math.max(campaign.openedCount, openedRecipients);
    const clickedCount = Math.max(campaign.clickedCount, clickedRecipients);
    const bouncedCount = Math.max(campaign.bouncedCount, bouncedRecipients);

    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickRate = deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;
    const clickToOpenRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
    const bounceRate = sentCount > 0 ? (bouncedCount / sentCount) * 100 : 0;

    const clicks = await this.prisma.emailTrackingEvent.findMany({
      where: { campaignId, eventType: 'CLICK', urlClicked: { not: null } },
      select: { urlClicked: true },
    });

    const linkMap: Record<string, number> = {};
    for (const c of clicks) {
      if (c.urlClicked) {
        linkMap[c.urlClicked] = (linkMap[c.urlClicked] || 0) + 1;
      }
    }

    const topClickedLinks = Object.entries(linkMap)
      .map(([url, count]) => ({ url, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status as any,
      providerType: campaign.providerType as any,
      totalRecipients: Math.max(campaign.totalRecipients, totalRecipientsCount),
      sentCount,
      deliveredCount,
      deliveryRate: Number(deliveryRate.toFixed(1)),
      openedCount,
      openRate: Number(openRate.toFixed(1)),
      clickedCount,
      clickRate: Number(clickRate.toFixed(1)),
      clickToOpenRate: Number(clickToOpenRate.toFixed(1)),
      bouncedCount,
      bounceRate: Number(bounceRate.toFixed(1)),
      unsubscribedCount: campaign.unsubscribedCount,
      complaintCount: campaign.complaintCount,
      topClickedLinks,
      hourlyActivity: [],
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
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.campaignRecipient.count({ where }),
      this.prisma.campaignRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ openCount: 'desc' }, { clickCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          lead: {
            select: { id: true, firstName: true, lastName: true, phone: true, temperature: true, status: true },
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
