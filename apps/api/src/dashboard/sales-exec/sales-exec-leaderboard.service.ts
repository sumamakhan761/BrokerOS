import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesExecLeaderboardService {
  constructor(private prisma: PrismaService) {}

  /** Monthly leaderboard for the whole sales executive department */
  async getSalesExecLeaderboard(userId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    // Get all sales exec users
    const deptUsers = await this.prisma.user.findMany({
      where: {
        role: { code: 'SALES_EXECUTIVE' },
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

    // For each user, calculate monthly metrics
    const leaderboardData = await Promise.all(
      deptUsers.map(async (agent) => {
        const [siteVisits, bookings] = await Promise.all([
          this.prisma.siteVisit.count({
            where: {
              salesExecId: agent.id,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.booking.count({
            where: {
              salesExecId: agent.id,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        // Weighted score: SV Completed * 40, Bookings * 60
        const score = siteVisits * 40 + bookings * 60;

        return {
          id: agent.id,
          name: agent.name,
          image: agent.image,
          employeeCode: agent.employeeCode,
          svCompleted: siteVisits,
          bookings,
          activeNegotiations: 0, // Placeholder
          score,
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
}
