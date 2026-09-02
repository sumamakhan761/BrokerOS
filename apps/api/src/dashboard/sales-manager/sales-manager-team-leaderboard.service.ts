import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesManagerTeamLeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTeamLeaderboard(
    subs: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    }[],
  ) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const leaderboardData = await Promise.all(
      subs.map(async (sub) => {
        const [svCompleted, bookings, activeNegotiations] = await Promise.all([
          this.prisma.siteVisit.count({
            where: {
              salesExecId: sub.id,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.booking.count({
            where: {
              salesExecId: sub.id,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.negotiation.count({
            where: {
              salesExecId: sub.id,
              status: { notIn: ['CLOSED', 'REJECTED'] },
            },
          }),
        ]);

        return {
          id: sub.id,
          name: sub.name || sub.username,
          image: sub.image,
          svCompleted,
          bookings,
          activeNegotiations,
          score: bookings * 10 + svCompleted * 2 + activeNegotiations, // Simple score calculation
        };
      }),
    );

    // Sort leaderboard by score descending
    leaderboardData.sort((a, b) => b.score - a.score);

    return leaderboardData;
  }
}
