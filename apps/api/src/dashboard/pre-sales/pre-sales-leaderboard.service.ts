import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class PreSalesLeaderboardService {
  constructor(private prisma: PrismaService) {}

  /** Monthly leaderboard for the whole pre-sales department */
  async getPreSalesLeaderboard(userId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    // Get all pre-sales users
    const deptUsers = await this.prisma.user.findMany({
      where: {
        role: { code: 'PRE_SALES' },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        image: true,
        employeeCode: true,
      },
    });

    // For each user, calculate monthly metrics in parallel
    const leaderboardData = await Promise.all(
      deptUsers.map(async (agent) => {
        const [coldCallsDone, followUpsDone, siteVisits] = await Promise.all([
          this.countColdCallsForMonth(agent.id, monthStart, monthEnd),
          this.prisma.followUp.count({
            where: {
              userId: agent.id,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.siteVisit.count({
            where: {
              createdById: agent.id,
              status: 'COMPLETED',
              scheduledDate: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        // Weighted score: cold calls 25%, follow-ups 25%, site visits 50%
        const score =
          coldCallsDone * 0.25 + followUpsDone * 0.25 + siteVisits * 0.5;

        return {
          userId: agent.id,
          name: agent.name,
          image: agent.image,
          employeeCode: agent.employeeCode,
          coldCalls: coldCallsDone,
          followUps: followUpsDone,
          siteVisits,
          score: Math.round(score * 100) / 100,
        };
      }),
    );

    // Sort by score descending, assign ranks
    leaderboardData.sort((a, b) => b.score - a.score);
    const ranked = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return {
      leaderboard: ranked,
      currentUserId: userId,
    };
  }

  /** Monthly leaderboard scoped to a manager's subordinates */
  async getPreSalesManagerLeaderboard(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const subs = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE' },
      select: { id: true, name: true, username: true },
    });
    const userIds = subs.map((s) => s.id);
    if (userIds.length === 0) return [];

    const stats = await Promise.all(
      userIds.map(async (userId) => {
        const [coldCalls, followUps, siteVisits] = await Promise.all([
          this.countColdCallsForMonth(userId, monthStart, monthEnd),
          this.prisma.followUp.count({
            where: {
              userId,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.siteVisit.count({
            where: {
              createdById: userId,
              status: 'COMPLETED',
              scheduledDate: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);
        return {
          userId,
          coldCalls,
          followUps,
          siteVisits,
          name:
            subs.find((s) => s.id === userId)?.name ||
            subs.find((s) => s.id === userId)?.username,
        };
      }),
    );

    // Score based on weighted metrics
    return stats
      .map((s) => {
        const score =
          s.coldCalls * 0.25 + s.followUps * 0.25 + s.siteVisits * 0.5;
        return {
          userId: s.userId,
          name: s.name,
          coldCalls: s.coldCalls,
          followUps: s.followUps,
          siteVisits: s.siteVisits,
          score: Math.round(score * 100) / 100,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /** Count cold calls for a user in a given month range */
  private async countColdCallsForMonth(
    userId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<number> {
    const callRecords = await this.prisma.callRecord.findMany({
      where: {
        userId,
        startedAt: { gte: monthStart, lte: monthEnd },
        leadId: { not: null },
      },
      select: { leadId: true, startedAt: true },
    });

    if (callRecords.length === 0) return 0;

    let coldCallCount = 0;
    for (const record of callRecords) {
      if (!record.leadId) continue;
      const earlierCall = await this.prisma.callRecord.findFirst({
        where: {
          userId,
          leadId: record.leadId,
          startedAt: { lt: monthStart },
        },
        select: { id: true },
      });
      if (!earlierCall) {
        coldCallCount++;
      }
    }

    return coldCallCount;
  }
}
