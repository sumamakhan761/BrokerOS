import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BusinessManagerEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployees(period?: string) {
    const now = new Date();
    let startDate: Date | undefined;
    let targetPeriod = 'ALL';

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      targetPeriod = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      targetPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      targetPeriod = `${now.getFullYear()}`;
    }

    const dateFilter = startDate ? { gte: startDate, lte: now } : undefined;

    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        role: true,
        department: true,
        targets: {
          where: targetPeriod !== 'ALL' ? { period: targetPeriod } : undefined,
        },
        recognitions: {
          where: targetPeriod !== 'ALL' ? { period: targetPeriod } : undefined,
        },
        callRecords: dateFilter ? { where: { createdAt: dateFilter } } : true,
        followUps: dateFilter ? { where: { scheduledDate: dateFilter } } : true,
        siteVisitsAsExec: dateFilter
          ? { where: { scheduledDate: dateFilter } }
          : true,
        salesExecBookings: dateFilter
          ? { where: { bookingDate: dateFilter, status: { not: 'CANCELLED' } } }
          : { where: { status: { not: 'CANCELLED' } } },
        closedBookings: dateFilter
          ? { where: { bookingDate: dateFilter, status: { not: 'CANCELLED' } } }
          : { where: { status: { not: 'CANCELLED' } } },
      },
    });

    const employees = users.map((u) => {
      const calls = u.callRecords.length;
      const followUps = u.followUps.length;
      const siteVisits = u.siteVisitsAsExec.length;
      // Some employees are Sales Execs, some are Closing Managers.
      // We combine their bookings for a unified metric.
      const bookingsCount =
        u.salesExecBookings.length + u.closedBookings.length;

      let bookingRevenue = 0;
      u.salesExecBookings.forEach(
        (b) => (bookingRevenue += Number(b.agreedPrice) || 0),
      );
      u.closedBookings.forEach(
        (b) => (bookingRevenue += Number(b.agreedPrice) || 0),
      );

      const target = u.targets[0];
      const recognitions = u.recognitions.map((r) => r.title);

      return {
        id: u.id,
        name: u.name || u.username,
        role: u.role?.name || 'Unknown',
        department: u.department?.name || 'Unassigned',
        metrics: {
          calls,
          followUps,
          siteVisits,
          bookings: bookingsCount,
          revenue: bookingRevenue,
        },
        target: target
          ? {
              calls: target.targetCalls,
              followUps: target.targetFollowUps,
              siteVisits: target.targetSiteVisits,
              bookings: target.targetBookings,
              revenue: Number(target.targetRevenue) || 0,
            }
          : null,
        recognitions,
        avatar: u.image,
      };
    });

    // Determine Laggards based on bottom 20% in calls or 0 bookings (if they are in Sales)
    const salesEmployees = employees.filter(
      (e) =>
        e.department.toUpperCase().includes('SALES') ||
        e.role.toUpperCase().includes('SALES'),
    );

    // Sort by calls to find bottom 20%
    const sortedByCalls = [...salesEmployees].sort(
      (a, b) => a.metrics.calls - b.metrics.calls,
    );
    const bottom20Count = Math.max(1, Math.floor(sortedByCalls.length * 0.2));
    const callLaggardIds = new Set(
      sortedByCalls.slice(0, bottom20Count).map((e) => e.id),
    );

    const laggards = salesEmployees
      .filter((e) => {
        // If no bookings, or very few calls
        return e.metrics.bookings === 0 || callLaggardIds.has(e.id);
      })
      .map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        reason: e.metrics.bookings === 0 ? 'Zero Bookings' : 'Low Call Volume',
        metrics: e.metrics,
      }));

    return {
      employees,
      laggards,
    };
  }
}
