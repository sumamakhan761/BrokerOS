import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class SalesManagerAnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getDateBoundary(timeRange?: string): Date | undefined {
    if (!timeRange || timeRange === 'all-time' || timeRange === 'all')
      return undefined;
    const now = new Date();
    const boundary = new Date();
    boundary.setHours(0, 0, 0, 0);
    if (timeRange === 'weekly') {
      boundary.setDate(now.getDate() - 7);
    } else if (timeRange === 'monthly') {
      boundary.setDate(now.getDate() - 30);
    } else if (timeRange === 'yearly') {
      boundary.setFullYear(now.getFullYear() - 1);
    }
    return boundary;
  }

  async getManagerSubordinates(managerId: string): Promise<string[]> {
    const subs = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE' },
      select: { id: true },
    });
    return subs.map((s) => s.id);
  }

  async getDetailedMetrics(userIds: string[], timeRange?: string) {
    if (userIds.length === 0) {
      return {
        salesFunnel: {
          assignedCustomers: 0,
          siteVisitsScheduled: 0,
          siteVisitsCompleted: 0,
          negotiations: 0,
          confirmedBookings: 0,
          conversionRate: '0.0',
        },
        teamAnalytics: { followUpsCompleted: 0, pendingSiteVisits: 0 },
        revenueAnalytics: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          quarterly: 0,
          averageBookingValue: 0,
          trend: [],
        },
      };
    }

    const startDate = this.getDateBoundary(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const now = new Date();

    // Date boundaries
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start of week

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);

    // 1. Sales Funnel & Team Analytics Base Queries
    const assignedCustomersCount = await this.prisma.lead.count({
      where: { assignedUserId: { in: userIds }, createdAt: dateFilter },
    });
    const siteVisitsScheduled = await this.prisma.siteVisit.count({
      where: {
        salesExecId: { in: userIds },
        status: { in: ['ASSIGNED', 'SCHEDULED'] },
        scheduledDate: dateFilter,
      },
    });
    const siteVisitsCompleted = await this.prisma.siteVisit.count({
      where: {
        salesExecId: { in: userIds },
        status: 'COMPLETED',
        scheduledDate: dateFilter,
      },
    });
    const negotiationsCount = await this.prisma.approvalRequest.count({
      where: { salesExecId: { in: userIds }, createdAt: dateFilter },
    });

    const followUpsCompleted = await this.prisma.followUp.count({
      where: {
        userId: { in: userIds },
        status: 'COMPLETED',
        updatedAt: dateFilter,
      },
    });

    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        salesExecId: { in: userIds },
        status: 'CONFIRMED',
        bookingDate: dateFilter,
      },
      select: { agreedPrice: true, bookingDate: true },
    });

    const confirmedBookingsCount = confirmedBookings.length;
    const conversionRate =
      assignedCustomersCount > 0
        ? ((confirmedBookingsCount / assignedCustomersCount) * 100).toFixed(1)
        : '0.0';

    // 2. Revenue Analytics Calculations
    let daily = 0,
      weekly = 0,
      monthly = 0,
      quarterly = 0;
    let totalRevenue = 0;

    // Trend grouping: let's group by last 7 days for a quick sparkline trend
    const trendMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      trendMap.set(d.toISOString().split('T')[0], 0);
    }

    confirmedBookings.forEach((b) => {
      const p = Number(b.agreedPrice || 0);
      const d = new Date(b.bookingDate);

      totalRevenue += p;

      if (d >= startOfToday) daily += p;
      if (d >= startOfWeek) weekly += p;
      if (d >= startOfMonth) monthly += p;
      if (d >= startOfQuarter) quarterly += p;

      // Update trend if within last 7 days
      const dateKey = d.toISOString().split('T')[0];
      if (trendMap.has(dateKey)) {
        trendMap.set(dateKey, trendMap.get(dateKey)! + p);
      }
    });

    const averageBookingValue =
      confirmedBookingsCount > 0 ? totalRevenue / confirmedBookingsCount : 0;
    const trend = Array.from(trendMap.entries()).map(([date, value]) => ({
      name: date,
      value,
    }));

    return {
      salesFunnel: {
        assignedCustomers: assignedCustomersCount,
        siteVisitsScheduled,
        siteVisitsCompleted,
        negotiations: negotiationsCount,
        confirmedBookings: confirmedBookingsCount,
        conversionRate,
      },
      teamAnalytics: {
        followUpsCompleted,
        pendingSiteVisits: siteVisitsScheduled, // re-using the same count for Pending UI
      },
      revenueAnalytics: {
        daily,
        weekly,
        monthly,
        quarterly,
        averageBookingValue,
        trend,
      },
    };
  }

  async getTeamFinancialMetrics(userIds: string[], timeRange?: string) {
    if (userIds.length === 0)
      return {
        totalRevenue: 0,
        realizedCommission: 0,
        projectedCommission: 0,
        averageTicketSize: 0,
        activeDeals: 0,
      };

    const startDate = this.getDateBoundary(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const bookings = await this.prisma.booking.findMany({
      where: {
        salesExecId: { in: userIds },
        status: { in: ['CONFIRMED'] },
        bookingDate: dateFilter,
      },
      include: {
        unit: true,
      },
    });

    let totalRevenue = 0;
    let realizedCommission = 0;
    let projectedCommission = 0;
    let countSold = 0;

    for (const booking of bookings) {
      if (!booking.unit) continue;

      if (booking.unit.status === 'SOLD') {
        totalRevenue += Number(booking.agreedPrice || 0);
        realizedCommission += Number(booking.commissionAmount || 0);
        countSold++;
      } else if (booking.unit.status === 'RESERVED') {
        projectedCommission += Number(booking.commissionAmount || 0);
      }
    }

    const averageTicketSize = countSold > 0 ? totalRevenue / countSold : 0;

    // Active deals (Reservations + Negotiations)
    const reservedUnits = await this.prisma.unit.count({
      where: { reservedForId: { in: userIds }, status: 'RESERVED' },
    });

    return {
      totalRevenue,
      realizedCommission,
      projectedCommission,
      averageTicketSize,
      activeDeals: reservedUnits,
    };
  }

  async getTeamFunnelMetrics(userIds: string[], timeRange?: string) {
    if (userIds.length === 0)
      return {
        leads: 0,
        siteVisits: 0,
        negotiations: 0,
        reserved: 0,
        sold: 0,
        conversionRate: '0.0',
      };

    const startDate = this.getDateBoundary(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const totalLeads = await this.prisma.lead.count({
      where: { assignedUserId: { in: userIds }, createdAt: dateFilter },
    });

    const siteVisits = await this.prisma.siteVisit.count({
      where: { salesExecId: { in: userIds }, scheduledDate: dateFilter },
    });

    const negotiations = await this.prisma.approvalRequest.count({
      where: { salesExecId: { in: userIds }, createdAt: dateFilter },
    });

    const reservedUnits = await this.prisma.unit.count({
      where: { reservedForId: { in: userIds }, status: 'RESERVED' },
    });

    const soldBookings = await this.prisma.booking.findMany({
      where: {
        salesExecId: { in: userIds },
        status: 'CONFIRMED',
        bookingDate: dateFilter,
      },
      include: { unit: true },
    });

    let soldCount = 0;
    soldBookings.forEach((b) => {
      if (b.unit && b.unit.status === 'SOLD') {
        soldCount++;
      }
    });

    const conversionRate =
      totalLeads > 0 ? ((soldCount / totalLeads) * 100).toFixed(1) : '0.0';

    return {
      leads: totalLeads,
      siteVisits,
      negotiations,
      reserved: reservedUnits,
      sold: soldCount,
      conversionRate,
    };
  }

  async getTeamLeaderboard(userIds: string[], timeRange?: string) {
    if (userIds.length === 0) return [];

    const startDate = this.getDateBoundary(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });

    const leaderboard: any[] = [];

    for (const user of users) {
      const siteVisits = await this.prisma.siteVisit.count({
        where: { salesExecId: user.id, scheduledDate: dateFilter },
      });
      const bookings = await this.prisma.booking.findMany({
        where: {
          salesExecId: user.id,
          status: 'CONFIRMED',
          bookingDate: dateFilter,
        },
        include: { unit: true },
      });
      const leadsAssigned = await this.prisma.lead.count({
        where: { assignedUserId: user.id, createdAt: dateFilter },
      });

      let revenue = 0;
      let unitsSold = 0;
      bookings.forEach((b) => {
        if (b.unit?.status === 'SOLD') {
          revenue += Number(b.agreedPrice || 0);
          unitsSold++;
        }
      });

      const conversionRate =
        leadsAssigned > 0 ? (unitsSold / leadsAssigned) * 100 : 0;

      leaderboard.push({
        id: user.id,
        name: user.name,
        image: user.image,
        revenue,
        svCompleted: siteVisits,
        bookings: unitsSold, // Changed from unitsSold to bookings
        activeNegotiations: 0, // Placeholder
        score: revenue > 0 ? (revenue / 1000000).toFixed(1) + 'M' : '0', // Added score
        rank: 0, // Placeholder, will assign during sort
        conversionRate: conversionRate.toFixed(1),
      });
    }

    const sorted = leaderboard.sort((a, b) => b.revenue - a.revenue);
    sorted.forEach((agent, index) => {
      agent.rank = index + 1;
    });
    return sorted;
  }

  async getInventoryAnalytics(managerId: string) {
    const subs = await this.getManagerSubordinates(managerId);
    const userIds = [managerId, ...subs];

    const assignments = await this.prisma.towerAssignment.findMany({
      where: { userId: { in: userIds } },
    });

    const assignedTowerIds = Array.from(
      new Set(assignments.map((a) => a.towerId)),
    );

    // Fetch projects that are either assigned OR just fetch all internal projects (isCpProject: false) if there are no assignments.
    // Strictly isolate CP projects so Sales Managers never see them.
    const projectQuery: any = { isCpProject: false };

    if (assignedTowerIds.length > 0) {
      projectQuery.towers = { some: { id: { in: assignedTowerIds } } };
    }

    const projects: any = await this.prisma.project.findMany({
      where: projectQuery,
      select: {
        id: true,
        name: true,
        towers: {
          where:
            assignedTowerIds.length > 0 ? { id: { in: assignedTowerIds } } : {},
          select: {
            id: true,
            name: true,
            totalUnits: true,
            floors: {
              select: {
                id: true,
                floorNumber: true,
                units: {
                  select: {
                    id: true,
                    unitNumber: true,
                    type: true,
                    facing: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const teamBookings = await this.prisma.booking.findMany({
      where: { salesExecId: { in: userIds }, status: 'CONFIRMED' },
      include: { unit: true },
    });

    const salesByType: Record<string, number> = {};
    const salesByFacing: Record<string, number> = {};

    teamBookings.forEach((b) => {
      if (b.unit) {
        if (b.unit.type) {
          salesByType[b.unit.type] = (salesByType[b.unit.type] || 0) + 1;
        }
        if (b.unit.facing) {
          salesByFacing[b.unit.facing] =
            (salesByFacing[b.unit.facing] || 0) + 1;
        }
      }
    });

    return {
      projects,
      salesByType: Object.keys(salesByType).map((name) => ({
        name,
        value: salesByType[name],
      })),
      salesByFacing: Object.keys(salesByFacing).map((name) => ({
        name,
        value: salesByFacing[name],
      })),
    };
  }
}
