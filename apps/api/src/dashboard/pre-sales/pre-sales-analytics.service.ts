import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class PreSalesAnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getStartDate(range?: string): Date | undefined {
    if (range === 'all-time') return undefined;

    const now = new Date();
    if (range === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    } else if (range === 'yearly') {
      return new Date(now.getFullYear(), 0, 1);
    }
    // Default to monthly
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  async getPreSalesAnalytics(userId: string, timeRange?: string) {
    const startDate = this.getStartDate(timeRange);
    const dateFilter = { gte: startDate };

    // 1. Pipeline Metrics (Plus-only/Cumulative)
    const pipelineGroups = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        assignedUserId: userId,
        status: {
          not: 'LOST',
        },
        updatedAt: dateFilter,
      },
      _count: true,
    });

    const lostLeads = await this.prisma.lead.count({
      where: {
        assignedUserId: userId,
        status: 'LOST',
        updatedAt: dateFilter,
      },
    });

    // Create a map for quick lookup
    const counts = pipelineGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Order of stages: NEW -> CONTACTED -> INTERESTED -> QUALIFIED -> SITE_VISIT_SCHEDULED -> SITE_VISIT_COMPLETED -> BOOKING
    // If a lead is in a higher stage, they inherently passed through the lower ones.
    const booked = counts['BOOKING'] || 0;
    const visitCompleted = (counts['SITE_VISIT_COMPLETED'] || 0) + booked;
    const visitScheduled =
      (counts['SITE_VISIT_SCHEDULED'] || 0) + visitCompleted;
    const qualified = (counts['QUALIFIED'] || 0) + visitScheduled;
    const interested = (counts['INTERESTED'] || 0) + qualified;
    const contacted = (counts['CONTACTED'] || 0) + interested;
    const newLeads = (counts['NEW'] || 0) + contacted;

    const totalLeads = newLeads + lostLeads;

    // We will keep 'siteVisits' for the pyramid which might group them, but expose them distinctly for stat cards.
    const siteVisits = visitScheduled;

    // 2. Call Metrics
    const callGroups = await this.prisma.callRecord.groupBy({
      by: ['status'],
      where: {
        userId,
        createdAt: dateFilter,
      },
      _count: {
        _all: true,
      },
      _avg: {
        duration: true,
      },
    });

    const callsMap = callGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = {
          count: curr._count._all,
          avgDuration: curr._avg?.duration || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; avgDuration: number }>,
    );

    const callsConnected = callsMap['CONNECTED']?.count || 0;
    const callsNotAnswered = callsMap['NOT_ANSWERED']?.count || 0;
    const callsBusy = callsMap['BUSY']?.count || 0;
    const callsFailed = callsMap['FAILED']?.count || 0;
    const callsVoicemail = callsMap['VOICEMAIL']?.count || 0;

    const callsMade =
      callsConnected +
      callsNotAnswered +
      callsBusy +
      callsFailed +
      callsVoicemail;
    const connectedPercentage =
      callsMade > 0 ? (callsConnected / callsMade) * 100 : 0;
    const avgTalkTime = callsMap['CONNECTED']?.avgDuration || 0;

    const leadToSiteVisitPercentage =
      totalLeads > 0 ? (siteVisits / totalLeads) * 100 : 0;

    // 3. Follow-Up Metrics
    const followUpGroups = await this.prisma.followUp.groupBy({
      by: ['status'],
      where: {
        userId,
        scheduledDate: dateFilter, // Using scheduledDate to see what was due in this period
      },
      _count: {
        _all: true,
      },
    });

    const followUpsMap = followUpGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      },
      {} as Record<string, number>,
    );

    const followUpsCompleted = followUpsMap['COMPLETED'] || 0;
    const followUpsMissed = followUpsMap['MISSED'] || 0;

    // 4. Daily Cold Call Targets (using latest log in the period)
    const latestDailyLog = await this.prisma.dailyPerformanceLog.findFirst({
      where: {
        userId,
        date: dateFilter,
      },
      orderBy: { date: 'desc' },
    });

    // 5. Lead Source Conversion (Site Visits by Source)
    const siteVisitsBySourceQuery = await this.prisma.lead.groupBy({
      by: ['sourceId'],
      where: {
        assignedUserId: userId,
        status: {
          in: ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'BOOKING'],
        },
        updatedAt: dateFilter,
      },
      _count: {
        _all: true,
      },
    });

    const sourceIds = siteVisitsBySourceQuery
      .map((g) => g.sourceId)
      .filter(Boolean) as string[];
    const leadSourcesData = await this.prisma.leadSource.findMany({
      where: { id: { in: sourceIds } },
    });
    const sourceMap = new Map(leadSourcesData.map((s) => [s.id, s.name]));

    const leadSources = siteVisitsBySourceQuery
      .map((group) => ({
        source: group.sourceId
          ? sourceMap.get(group.sourceId) || 'Unknown'
          : 'Organic/Other',
        count: group._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      pipeline: {
        totalLeads,
        newLeads,
        contacted,
        interested,
        qualified,
        visitScheduled,
        visitCompleted,
        siteVisits, // Keeping for backward compatibility with mobile/pyramid
        booked,
        lost: lostLeads,
      },
      calls: {
        made: callsMade,
        connected: callsConnected,
        notAnswered: callsNotAnswered,
        busy: callsBusy,
        failed: callsFailed,
        voicemail: callsVoicemail,
        connectedPercentage: parseFloat(connectedPercentage.toFixed(1)),
        avgTalkTimeSeconds: Math.round(avgTalkTime),
      },
      followUps: {
        completed: followUpsCompleted,
        missed: followUpsMissed,
      },
      targets: {
        coldCallTarget: latestDailyLog?.coldCallTarget || 100,
        coldCallsDone: latestDailyLog?.coldCallsDone || 0,
      },
      sources: leadSources,
      conversions: {
        leadToSiteVisitPercentage: parseFloat(
          leadToSiteVisitPercentage.toFixed(1),
        ),
      },
    };
  }
}
