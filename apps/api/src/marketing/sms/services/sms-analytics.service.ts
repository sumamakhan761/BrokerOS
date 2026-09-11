import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  SmsCampaignAnalyticsSummary,
  SmsSenderNumberAnalytics,
} from '@brokeros/types';

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
      senderPools,
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
      this.prisma.campaignSmsSenderPool.findMany({
        where: { campaignId },
        include: {
          senderNumber: {
            include: {
              integration: {
                select: { provider: true, name: true },
              },
            },
          },
        },
      }),
    ]);

    const sentCount = Math.max(
      campaign.sentCount,
      deliveredCount + failedCount,
    );
    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const clickRate =
      deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;
    const failRate = sentCount > 0 ? (failedCount / sentCount) * 100 : 0;

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

    const senderBreakdown: SmsSenderNumberAnalytics[] = await Promise.all(
      senderPools.map(async (pool) => {
        const [poolDelivered, poolClicked, poolFailed] = await Promise.all([
          this.prisma.smsRecipient.count({
            where: {
              campaignId,
              senderPoolId: pool.id,
              status: 'DELIVERED',
            },
          }),
          this.prisma.smsRecipient.count({
            where: {
              campaignId,
              senderPoolId: pool.id,
              clickCount: { gt: 0 },
            },
          }),
          this.prisma.smsRecipient.count({
            where: {
              campaignId,
              senderPoolId: pool.id,
              status: 'FAILED',
            },
          }),
        ]);

        const pSent = Math.max(pool.sentCount, poolDelivered + poolFailed);
        const pDelivered = Math.max(pool.deliveredCount, poolDelivered);
        const pFailed = Math.max(pool.failedCount, poolFailed);
        const pDeliveryRate = pSent > 0 ? (pDelivered / pSent) * 100 : 0;
        const pClickRate = pDelivered > 0 ? (poolClicked / pDelivered) * 100 : 0;
        const pFailRate = pSent > 0 ? (pFailed / pSent) * 100 : 0;

        return {
          senderPoolId: pool.id,
          phoneNumber: pool.phoneNumber || pool.senderNumber?.phoneNumber || undefined,
          senderId: pool.senderId || pool.senderNumber?.senderId || undefined,
          provider: (pool.provider || pool.senderNumber?.provider || campaign.providerType) as any,
          allocatedRecipients: pool.allocatedRecipients,
          sentCount: pSent,
          deliveredCount: pDelivered,
          deliveryRate: Number(pDeliveryRate.toFixed(1)),
          clickedCount: poolClicked,
          clickRate: Number(pClickRate.toFixed(1)),
          failedCount: pFailed,
          failRate: Number(pFailRate.toFixed(1)),
          totalSegmentsSent: pDelivered, // 1 segment standard approximation
        };
      }),
    );

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
      failRate: Number(failRate.toFixed(1)),
      totalSegmentsSent: campaign.totalSegmentsSent,
      topClickedLinks,
      senderBreakdown: senderBreakdown.length > 0 ? senderBreakdown : undefined,
    };
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      engagement?: string;
      crmStatus?: string;
    },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 25;
    const skip = (page - 1) * limit;

    const repliedMessages = await this.prisma.smsInboundMessage.findMany({
      where: {
        OR: [{ matchedCampaignId: campaignId }, { matchedRecipientId: { not: null } }],
      },
      select: { matchedRecipientId: true },
    });
    const repliedRecipientIds = new Set(
      repliedMessages.map((m) => m.matchedRecipientId).filter(Boolean) as string[],
    );

    const [totalCount, deliveredCount, clickedCount, failedCount, crmLeadsCount] =
      await Promise.all([
        this.prisma.smsRecipient.count({ where: { campaignId } }),
        this.prisma.smsRecipient.count({
          where: { campaignId, status: 'DELIVERED' },
        }),
        this.prisma.smsRecipient.count({
          where: {
            campaignId,
            OR: [{ clickCount: { gt: 0 } }, { status: 'CLICKED' }],
          },
        }),
        this.prisma.smsRecipient.count({
          where: { campaignId, status: 'FAILED' },
        }),
        this.prisma.smsRecipient.count({
          where: { campaignId, leadId: { not: null } },
        }),
      ]);

    const repliedCount = repliedRecipientIds.size;

    const where: any = { campaignId };
    if (query?.status) where.status = query.status;

    if (query?.engagement) {
      switch (query.engagement.toUpperCase()) {
        case 'CLICKED':
          where.clickCount = { gt: 0 };
          break;
        case 'REPLIED':
          where.id = { in: Array.from(repliedRecipientIds) };
          break;
        case 'DELIVERED':
          where.status = 'DELIVERED';
          break;
        case 'FAILED':
          where.status = 'FAILED';
          break;
      }
    }

    if (query?.crmStatus) {
      if (query.crmStatus === 'LINKED') {
        where.leadId = { not: null };
      } else if (query.crmStatus === 'UNLINKED') {
        where.leadId = null;
      }
    }

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

    const enrichedItems = items.map((r) => ({
      ...r,
      hasReplied: repliedRecipientIds.has(r.id),
    }));

    return {
      items: enrichedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counters: {
        totalCount,
        deliveredCount,
        clickedCount,
        failedCount,
        repliedCount,
        crmLeadsCount,
      },
    };
  }
}
