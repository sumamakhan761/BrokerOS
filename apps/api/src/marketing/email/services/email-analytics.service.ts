import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { CampaignAnalyticsSummary } from '@brokeros/types';

@Injectable()
export class EmailAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignAnalytics(
    campaignId: string,
  ): Promise<CampaignAnalyticsSummary> {
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
        where: {
          campaignId,
          status: { in: ['DELIVERED', 'OPENED', 'CLICKED', 'SENT'] },
        },
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
          OR: [{ status: 'CLICKED' }, { clickCount: { gt: 0 } }],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: { campaignId, status: { in: ['BOUNCED', 'FAILED'] } },
      }),
    ]);

    const sentCount = Math.max(
      campaign.sentCount,
      deliveredRecipients + bouncedRecipients,
    );
    const deliveredCount = Math.max(
      campaign.deliveredCount,
      deliveredRecipients,
    );
    const openedCount = Math.max(campaign.openedCount, openedRecipients);
    const clickedCount = Math.max(campaign.clickedCount, clickedRecipients);
    const bouncedCount = Math.max(campaign.bouncedCount, bouncedRecipients);

    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const openRate =
      deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickRate =
      deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;
    const clickToOpenRate =
      openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
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

    const senderPools = await this.prisma.campaignSenderPool.findMany({
      where: { campaignId },
      include: {
        senderDomain: {
          include: {
            integration: {
              select: { provider: true, name: true },
            },
          },
        },
      },
    });

    const domainBreakdown = await Promise.all(
      senderPools.map(async (pool) => {
        const [poolDelivered, poolOpened, poolClicked, poolBounced] =
          await Promise.all([
            this.prisma.campaignRecipient.count({
              where: {
                campaignId,
                senderPoolId: pool.id,
                status: { in: ['DELIVERED', 'OPENED', 'CLICKED', 'SENT'] },
              },
            }),
            this.prisma.campaignRecipient.count({
              where: {
                campaignId,
                senderPoolId: pool.id,
                OR: [
                  { status: { in: ['OPENED', 'CLICKED'] } },
                  { openCount: { gt: 0 } },
                ],
              },
            }),
            this.prisma.campaignRecipient.count({
              where: {
                campaignId,
                senderPoolId: pool.id,
                OR: [{ status: 'CLICKED' }, { clickCount: { gt: 0 } }],
              },
            }),
            this.prisma.campaignRecipient.count({
              where: {
                campaignId,
                senderPoolId: pool.id,
                status: { in: ['BOUNCED', 'FAILED'] },
              },
            }),
          ]);

        const pSent = Math.max(pool.sentCount, poolDelivered + poolBounced);
        const pDelivered = Math.max(pool.deliveredCount, poolDelivered);
        const pOpenRate = pDelivered > 0 ? (poolOpened / pDelivered) * 100 : 0;
        const pClickRate = pDelivered > 0 ? (poolClicked / pDelivered) * 100 : 0;
        const pBounceRate = pSent > 0 ? (poolBounced / pSent) * 100 : 0;

        return {
          senderPoolId: pool.id,
          domain: pool.senderDomain?.domain || pool.domain || 'default',
          fromEmail: pool.senderDomain?.fromEmail || pool.fromEmail || 'default',
          fromName: pool.senderDomain?.fromName || pool.fromName || 'Sales Team',
          provider: (pool.senderDomain?.integration?.provider || pool.provider || 'SYSTEM_DEFAULT') as any,
          allocatedRecipients: pool.allocatedRecipients,
          sentCount: pSent,
          deliveredCount: pDelivered,
          deliveryRate: pSent > 0 ? Number(((pDelivered / pSent) * 100).toFixed(1)) : 0,
          openedCount: poolOpened,
          openRate: Number(pOpenRate.toFixed(1)),
          clickedCount: poolClicked,
          clickRate: Number(pClickRate.toFixed(1)),
          bouncedCount: poolBounced,
          bounceRate: Number(pBounceRate.toFixed(1)),
        };
      }),
    );

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status,
      providerType: campaign.providerType,
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
      domainBreakdown: domainBreakdown.length > 0 ? domainBreakdown : undefined,
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
      source?: string;
    },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 500;
    const skip = (page - 1) * limit;

    // Track inbound replies associated with this campaign or recipient
    const repliedMessages = await this.prisma.emailInboundMessage.findMany({
      where: {
        OR: [{ matchedCampaignId: campaignId }, { matchedRecipientId: { not: null } }],
      },
      select: { matchedRecipientId: true },
    });
    const repliedRecipientIds = new Set(
      repliedMessages.map((m) => m.matchedRecipientId).filter(Boolean) as string[],
    );

    // Compute live counter breakdown across the entire campaign
    const [totalCount, openedCount, clickedCount, bouncedCount, crmLeadsCount] = await Promise.all([
      this.prisma.campaignRecipient.count({ where: { campaignId } }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [{ openCount: { gt: 0 } }, { status: { in: ['OPENED', 'CLICKED'] } }],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [{ clickCount: { gt: 0 } }, { status: 'CLICKED' }],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          status: { in: ['BOUNCED', 'FAILED'] },
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          leadId: { not: null },
        },
      }),
    ]);

    const repliedCount = repliedRecipientIds.size;
    const unopenedCount = Math.max(0, totalCount - openedCount - bouncedCount);
    const unpromotedCount = Math.max(0, totalCount - crmLeadsCount);

    const where: any = { campaignId };
    if (query?.status) where.status = query.status;
    if (query?.source) where.source = query.source;

    // Filter by CRM status
    if (query?.crmStatus === 'UNPROMOTED') {
      where.leadId = null;
    } else if (query?.crmStatus === 'IN_CRM') {
      where.leadId = { not: null };
    }

    // Filter by Engagement
    if (query?.engagement === 'OPENED') {
      where.OR = [{ openCount: { gt: 0 } }, { status: { in: ['OPENED', 'CLICKED'] } }];
    } else if (query?.engagement === 'CLICKED') {
      where.OR = [{ clickCount: { gt: 0 } }, { status: 'CLICKED' }];
    } else if (query?.engagement === 'UNOPENED') {
      where.openCount = 0;
      where.status = { notIn: ['BOUNCED', 'FAILED'] };
    } else if (query?.engagement === 'BOUNCED') {
      where.status = { in: ['BOUNCED', 'FAILED'] };
    } else if (query?.engagement === 'REPLIED') {
      where.id = { in: Array.from(repliedRecipientIds) };
    }

    if (query?.search) {
      where.AND = [
        {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' } },
            { name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
          ],
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.campaignRecipient.count({ where }),
      this.prisma.campaignRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { openCount: 'desc' },
          { clickCount: 'desc' },
          { createdAt: 'desc' },
        ],
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
      items: items.map((r) => ({
        ...r,
        hasReplied: repliedRecipientIds.has(r.id),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts: {
        all: totalCount,
        opened: openedCount,
        clicked: clickedCount,
        replied: repliedCount,
        unopened: unopenedCount,
        bounced: bouncedCount,
        inCrm: crmLeadsCount,
        unpromoted: unpromotedCount,
      },
    };
  }
}
