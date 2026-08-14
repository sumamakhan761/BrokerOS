import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange, getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesExecWidgetsService {
  constructor(private prisma: PrismaService) {}

  async getWidgets(userId: string) {
    const { start: todayStart, end: todayEnd } = getTodayRange();
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const [
      siteVisitsScheduledThisMonth,
      siteVisitsDoneThisMonth,
      todaySiteVisitsDone,
      bookingsThisMonth,
      negotiationsOngoing,
    ] = await Promise.all([
      // Total SV scheduled this month
      this.prisma.siteVisit.count({
        where: {
          salesExecId: userId,
          scheduledDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      // SVs completed this month
      this.prisma.siteVisit.count({
        where: {
          salesExecId: userId,
          status: 'COMPLETED',
          completedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Today's SVs done
      this.prisma.siteVisit.count({
        where: {
          salesExecId: userId,
          status: 'COMPLETED',
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Bookings this month
      this.prisma.booking.count({
        where: {
          salesExecId: userId,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Ongoing negotiations
      this.prisma.negotiation.count({
        where: {
          salesExecId: userId,
          status: { notIn: ['CLOSED', 'REJECTED'] },
        },
      }),
    ]);

    return {
      siteVisitsScheduled: siteVisitsScheduledThisMonth,
      todaySiteVisitsDone,
      siteVisitsCompleted: siteVisitsDoneThisMonth,
      negotiations: negotiationsOngoing,
      bookingsGenerated: bookingsThisMonth,
    };
  }
}
