import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class SourcingManagerAnalyticsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get the CP project IDs assigned to this user via ProjectAssignment.
   * Only returns projects where isCpProject = true.
   */
  private async getAssignedCpProjectIds(userId: string): Promise<string[]> {
    const assignments = await this.prisma.projectAssignment.findMany({
      where: {
        userId,
        isActive: true,
        project: { isCpProject: true }
      },
      select: { projectId: true }
    });
    return assignments.map(a => a.projectId);
  }

  async getAnalytics(userId: string, range: string) {
    const now = new Date();
    let start: Date | undefined = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (range === 'weekly') {
      start.setDate(now.getDate() - 7);
    } else if (range === 'monthly') {
      start.setMonth(now.getMonth() - 1);
    } else if (range === 'yearly') {
      start.setFullYear(now.getFullYear() - 1);
    } else {
      start = undefined; // all-time
    }

    const end = now;
    const dateFilter = start ? { gte: start, lte: end } : undefined;

    // Step 1: Get assigned CP project IDs
    const cpProjectIds = await this.getAssignedCpProjectIds(userId);

    // 1. Top Row Widgets
    const totalBrokers = await this.prisma.broker.count({
      where: { sourcingManagerId: userId, ...(start ? { createdAt: dateFilter } : {}) }
    });

    const allBrokers = await this.prisma.broker.findMany({
      where: { sourcingManagerId: userId },
      select: { id: true, name: true, profilePhotoUrl: true }
    });
    const brokerIds = allBrokers.map(b => b.id);

    const totalMeetings = await this.prisma.brokerMeeting.count({
      where: { userId, ...(start ? { scheduledDate: dateFilter } : {}) }
    });

    const totalFollowUps = await this.prisma.followUp.count({
      where: { broker: { sourcingManagerId: userId }, ...(start ? { scheduledDate: dateFilter } : {}) }
    });

    // Bookings for these brokers — SCOPED TO ASSIGNED CP PROJECTS
    const bookings = await this.prisma.booking.findMany({
      where: {
        // PROJECT SCOPE: Only bookings in units belonging to assigned CP projects
        unit: {
          floor: {
            tower: {
              projectId: { in: cpProjectIds }
            }
          }
        },
        // BROKER SCOPE: Only bookings linked to this manager's brokers
        OR: [
          { customer: { lead: { brokerId: { in: brokerIds } } } },
          { brokerageRecords: { some: { brokerId: { in: brokerIds } } } }
        ],
        ...(start ? { bookingDate: dateFilter } : {})
      },
      include: {
        customer: { include: { lead: true } },
        brokerageRecords: { where: { brokerId: { in: brokerIds } } },
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: { project: true }
                }
              }
            }
          }
        },
        possession: true
      }
    });

    let totalBookingsGenerated = 0;
    let totalBookingRevenue = 0;
    let totalBrokerCommissionPaid = 0;
    let totalRevenueHandoverDone = 0;

    const brokerRevenueMap = new Map<string, { revenue: number, units: number, projects: Set<string> }>();
    const projectRevenueMap = new Map<string, { revenue: number, units: number, brokers: Set<string> }>();
    const projectBookingsMap = new Map<string, number>();

    for (const b of allBrokers) {
      brokerRevenueMap.set(b.id, { revenue: 0, units: 0, projects: new Set() });
    }

    for (const booking of bookings) {
      totalBookingsGenerated += 1;
      totalBookingRevenue += Number(booking.tokenAmount) || 0;

      const isHandoverDone = booking.status === 'HANDOVER_COMPLETED' ||
        booking.possession?.status === 'HANDED_OVER' ||
        (booking.customer?.lead?.status === 'HANDOVER' && booking.customer?.lead?.subStatus === 'DONE');

      const bookingPayable = Number(booking.totalPayable) || 0;
      if (isHandoverDone) {
        totalRevenueHandoverDone += bookingPayable;
      }

      let commission = Number(booking.commissionAmount) || 0;
      for (const record of booking.brokerageRecords) {
        commission += Number(record.paidAmount) || Number(record.netPayable) || 0;
      }
      totalBrokerCommissionPaid += commission;

      const projName = booking.unit?.floor?.tower?.project?.name || 'Unknown Project';

      // Project bookings
      projectBookingsMap.set(projName, (projectBookingsMap.get(projName) || 0) + 1);

      const involvedBrokerIds = new Set<string>();
      if (booking.customer?.lead?.brokerId && brokerIds.includes(booking.customer.lead.brokerId)) {
        involvedBrokerIds.add(booking.customer.lead.brokerId);
      }
      for (const record of booking.brokerageRecords) {
        if (brokerIds.includes(record.brokerId)) {
          involvedBrokerIds.add(record.brokerId);
        }
      }

      // Add to broker and project maps
      for (const bId of involvedBrokerIds) {
        // Broker revenue map
        const bStats = brokerRevenueMap.get(bId);
        if (bStats) {
          bStats.revenue += bookingPayable;
          bStats.units += 1;
          bStats.projects.add(projName);
        }

        // Project revenue map
        if (!projectRevenueMap.has(projName)) {
          projectRevenueMap.set(projName, { revenue: 0, units: 0, brokers: new Set() });
        }
        const pStats = projectRevenueMap.get(projName)!;
        pStats.revenue += bookingPayable;
        pStats.units += 1;

        const brokerObj = allBrokers.find(b => b.id === bId);
        if (brokerObj) pStats.brokers.add(brokerObj.name);
      }
    }

    // Pie chart formatting
    const brokerWiseRevenue = Array.from(brokerRevenueMap.entries())
      .filter(([_, stats]) => stats.revenue > 0 || stats.units > 0)
      .map(([id, stats]) => {
        const broker = allBrokers.find(b => b.id === id);
        return {
          name: broker?.name || 'Unknown',
          revenue: stats.revenue,
          unitsSold: stats.units,
          projects: Array.from(stats.projects).join(', ')
        };
      }).sort((a, b) => b.revenue - a.revenue);

    const projectWiseRevenue = Array.from(projectRevenueMap.entries())
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        unitsSold: stats.units,
        topBrokers: Array.from(stats.brokers).join(', ')
      })).sort((a, b) => b.revenue - a.revenue);

    const projectWiseBookings = Array.from(projectBookingsMap.entries())
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units);

    // Most Selling Project
    const mostSellingProject = projectWiseRevenue[0] || null;

    // Broker Activation Rate
    let activeBrokersCount = 0;
    for (const [_, stats] of brokerRevenueMap.entries()) {
      if (stats.units > 0) activeBrokersCount++;
    }
    const totalBrokersAllTime = allBrokers.length;
    const brokerActivationRate = totalBrokersAllTime > 0
      ? Math.round((activeBrokersCount / totalBrokersAllTime) * 100)
      : 0;

    // Conversion Rates — SCOPED TO ASSIGNED CP PROJECTS
    const leadsGenerated = await this.prisma.lead.count({
      where: {
        brokerId: { in: brokerIds },
        interestedProjectId: { in: cpProjectIds },
        ...(start ? { createdAt: dateFilter } : {})
      }
    });

    const siteVisits = await this.prisma.siteVisit.count({
      where: {
        lead: { brokerId: { in: brokerIds } },
        projectId: { in: cpProjectIds },
        status: 'COMPLETED',
        ...(start ? { scheduledDate: dateFilter } : {})
      }
    });

    const conversionRates = {
      leads: leadsGenerated,
      siteVisits: siteVisits,
      bookings: totalBookingsGenerated
    };

    const top5Brokers = brokerWiseRevenue.slice(0, 5).map((b, idx) => ({ ...b, rank: idx + 1 }));

    return {
      topWidgets: {
        totalBrokers,
        totalMeetings,
        totalFollowUps,
        totalBookingsGenerated,
        totalBookingRevenue,
        totalBrokerCommissionPaid,
        totalRevenueHandoverDone
      },
      charts: {
        brokerWiseRevenue,
        projectWiseRevenue,
        projectWiseBookings
      },
      mostSellingProject,
      brokerActivationRate,
      conversionRates,
      top5Brokers
    };
  }
}
