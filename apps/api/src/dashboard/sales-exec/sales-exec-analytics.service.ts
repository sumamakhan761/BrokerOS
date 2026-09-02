import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class SalesExecAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialMetrics(userId: string) {
    // We only care about units that are 'SOLD' for revenue, and 'RESERVED' + 'SOLD' for commission
    const bookings = await this.prisma.booking.findMany({
      where: {
        salesExecId: userId,
        status: { in: ['CONFIRMED'] },
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

    return {
      totalRevenue,
      realizedCommission,
      projectedCommission,
      averageTicketSize,
    };
  }

  async getFunnelMetrics(userId: string) {
    const totalLeads = await this.prisma.lead.count({
      where: { assignedUserId: userId },
    });

    const siteVisits = await this.prisma.siteVisit.count({
      where: { salesExecId: userId },
    });

    const negotiations = await this.prisma.approvalRequest.count({
      where: { salesExecId: userId },
    });

    // Reservations (deals in progress)
    const reservedUnits = await this.prisma.unit.count({
      where: { reservedForId: userId, status: 'RESERVED' },
    });

    // Sold (closed deals)
    // Sometimes sold deals might drop the reservedForId, but let's assume it stays or we query via booking
    const soldBookings = await this.prisma.booking.findMany({
      where: { salesExecId: userId, status: 'CONFIRMED' },
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

  async getInventoryAnalytics(userId: string) {
    // For heatmap and inventory breakdown, grab all internal projects (no CP projects)
    const projects = await this.prisma.project.findMany({
      where: { isCpProject: false },
      select: {
        id: true,
        name: true,
        towers: {
          select: {
            id: true,
            name: true,
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

    const myBookings = await this.prisma.booking.findMany({
      where: { salesExecId: userId, status: 'CONFIRMED' },
      include: { unit: true },
    });

    const salesByType: Record<string, number> = {};
    const salesByFacing: Record<string, number> = {};

    myBookings.forEach((b) => {
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

  async getProjectAnalytics(userId: string) {
    // 1. Most Visited Projects
    const siteVisits = await this.prisma.siteVisit.findMany({
      where: { salesExecId: userId },
      include: { project: { select: { name: true } } },
    });
    const visitCounts: Record<string, number> = {};
    siteVisits.forEach((sv) => {
      const pName = sv.project?.name || 'Unknown';
      visitCounts[pName] = (visitCounts[pName] || 0) + 1;
    });

    // 2. Most Booked Projects
    const bookings = await this.prisma.booking.findMany({
      where: { salesExecId: userId, status: 'CONFIRMED' },
      include: {
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: { project: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });
    const bookedCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      const pName = b.unit?.floor?.tower?.project?.name;
      if (pName) {
        bookedCounts[pName] = (bookedCounts[pName] || 0) + 1;
      }
    });

    // 3. Customer Interest by Project
    const leads = await this.prisma.lead.findMany({
      where: { assignedUserId: userId },
      include: { interestedProject: { select: { name: true } } },
    });
    const interestCounts: Record<string, number> = {};
    leads.forEach((l) => {
      const pName = l.interestedProject?.name;
      if (pName) {
        interestCounts[pName] = (interestCounts[pName] || 0) + 1;
      }
    });

    const mapToSortedArray = (dict: Record<string, number>) => {
      return Object.entries(dict)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5
    };

    return {
      mostVisited: mapToSortedArray(visitCounts),
      mostBooked: mapToSortedArray(bookedCounts),
      customerInterest: mapToSortedArray(interestCounts),
    };
  }

  async getActivityAnalytics(userId: string) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const siteVisits = await this.prisma.siteVisit.findMany({
      where: {
        salesExecId: userId,
        scheduledDate: { gte: ninetyDaysAgo },
      },
      select: { scheduledDate: true, actualDate: true },
    });

    const followUps = await this.prisma.followUp.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
        scheduledDate: { gte: ninetyDaysAgo },
      },
      select: { scheduledDate: true },
    });

    const activityMap: Record<
      string,
      { siteVisits: number; followUps: number }
    > = {};

    siteVisits.forEach((sv) => {
      const dateStr = (sv.actualDate || sv.scheduledDate)
        .toISOString()
        .split('T')[0];
      if (!activityMap[dateStr])
        activityMap[dateStr] = { siteVisits: 0, followUps: 0 };
      activityMap[dateStr].siteVisits += 1;
    });

    followUps.forEach((fu) => {
      const dateStr = fu.scheduledDate.toISOString().split('T')[0];
      if (!activityMap[dateStr])
        activityMap[dateStr] = { siteVisits: 0, followUps: 0 };
      activityMap[dateStr].followUps += 1;
    });

    return Object.entries(activityMap)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
