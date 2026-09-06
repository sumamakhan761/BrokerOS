// ============================================================================
// BrokerOS — WhatsApp Hub Overview Analytics Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';

@Injectable()
export class WhatsAppOverviewService {
  private readonly logger = new Logger(WhatsAppOverviewService.name);
  private readonly prisma = prismaClient;

  constructor(private readonly configService: WhatsAppConfigService) { }

  /**
   * Fetches real live WhatsApp & CRM metrics:
   * - Real active conversation counts & unread badges
   * - Real broadcast campaign totals
   * - Real 7-day inbound vs outbound message timeline
   * - Real Meta deliverability funnel based on actual WhatsAppMessage rows
   * - AI Concierge operational status
   */
  async getOverviewStats(accountId?: string) {
    const account = await this.configService.getDecryptedAccount(accountId);
    const accId = account?.id;
    const accountFilter = accId ? { accountId: accId } : {};
    const messageAccountFilter = accId ? { conversation: { accountId: accId } } : {};

    // 1. Core Counts
    const [
      activeConversationsCount,
      unreadAgg,
      totalBroadcastsCount,
      totalContactsCount,
      aiConfig,
    ] = await Promise.all([
      this.prisma.whatsAppConversation.count({
        where: { ...accountFilter, status: 'open' },
      }),
      this.prisma.whatsAppConversation.aggregate({
        where: accountFilter,
        _sum: { unreadCount: true },
      }),
      this.prisma.whatsAppBroadcast.count({
        where: accountFilter,
      }),
      this.prisma.whatsAppContact.count({
        where: accountFilter,
      }),
      accId
        ? this.prisma.whatsAppAiConfig.findUnique({
          where: { accountId: accId },
        })
        : null,
    ]);

    const totalUnread = unreadAgg._sum.unreadCount || 0;

    // 2. Deliverability Metrics from actual messages
    const [
      totalSent,
      totalDelivered,
      totalRead,
      totalReplies,
      totalFailed,
    ] = await Promise.all([
      this.prisma.whatsAppMessage.count({
        where: {
          ...messageAccountFilter,
          direction: 'OUTBOUND',
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          ...messageAccountFilter,
          direction: 'OUTBOUND',
          status: { in: ['DELIVERED', 'READ'] },
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          ...messageAccountFilter,
          direction: 'OUTBOUND',
          status: 'READ',
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          ...messageAccountFilter,
          direction: 'INBOUND',
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          ...messageAccountFilter,
          direction: 'OUTBOUND',
          status: 'FAILED',
        },
      }),
    ]);

    // Calculate actual rates
    const deliveredPct = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    const readPct = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;
    const repliedPct = totalDelivered > 0 ? Math.round((totalReplies / totalDelivered) * 100) : 0;
    const reliability = totalSent > 0
      ? Number((((totalSent - totalFailed) / totalSent) * 100).toFixed(1))
      : 100.0;

    // 3. Real 7-Day Traffic Timeline
    const trafficDays: Array<{ dateStr: string; day: string; outbound: number; inbound: number }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateKey = d.toISOString().split('T')[0];

      trafficDays.push({
        dateStr: dateKey,
        day: dayName,
        outbound: 0,
        inbound: 0,
      });
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentMessages = await this.prisma.whatsAppMessage.findMany({
      where: {
        ...messageAccountFilter,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        direction: true,
        createdAt: true,
      },
    });

    for (const msg of recentMessages) {
      const msgDateKey = msg.createdAt.toISOString().split('T')[0];
      const targetDay = trafficDays.find((td) => td.dateStr === msgDateKey);
      if (targetDay) {
        if (msg.direction === 'OUTBOUND') {
          targetDay.outbound++;
        } else {
          targetDay.inbound++;
        }
      }
    }

    // 4. Recent activity
    const [recentConversations, recentBroadcasts] = await Promise.all([
      this.prisma.whatsAppConversation.findMany({
        where: accountFilter,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          contact: {
            select: { name: true, phone: true },
          },
        },
      }),
      this.prisma.whatsAppBroadcast.findMany({
        where: accountFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      connected: Boolean(account?.isActive),
      activeConversations: activeConversationsCount,
      totalUnread,
      totalBroadcasts: totalBroadcastsCount,
      totalContacts: totalContactsCount,
      aiActive: Boolean(aiConfig?.isActive),
      aiProvider: aiConfig?.provider || null,
      reliability,
      traffic7Days: trafficDays.map((td) => ({
        day: td.day,
        date: td.dateStr,
        outbound: td.outbound,
        inbound: td.inbound,
      })),
      funnel: {
        totalSent,
        totalDelivered,
        totalRead,
        totalReplies,
        totalFailed,
        deliveredPct,
        readPct,
        repliedPct,
      },
      recentConversations: recentConversations.map((c) => ({
        id: c.id,
        contactName: c.contactName || c.contact?.name || 'Unknown Contact',
        contactPhone: c.contactPhone,
        status: c.status,
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c.unreadCount,
      })),
      recentBroadcasts: recentBroadcasts.map((b) => ({
        id: b.id,
        name: b.name,
        templateName: b.templateName,
        status: b.status,
        totalRecipients: b.totalRecipients,
        sentCount: b.sentCount,
        deliveredCount: b.deliveredCount,
        readCount: b.readCount,
        createdAt: b.createdAt,
      })),
    };
  }
}
