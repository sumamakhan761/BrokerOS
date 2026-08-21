import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class ClosingManagerAnalyticsService {
  constructor(private readonly prisma: PrismaService) { }

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
    try {
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

      // Step 1: Get assigned CP project IDs for this closing manager
      const cpProjectIds = await this.getAssignedCpProjectIds(userId);

      // Project-scoped booking filter specific to this closing manager
      const bookingFilter: any = {
        status: { not: 'CANCELLED' },
        closingManagerId: userId,
        unit: {
          floor: {
            tower: {
              projectId: { in: cpProjectIds }
            }
          }
        },
        ...(start ? { bookingDate: dateFilter } : {})
      };

      const bookings = await this.prisma.booking.findMany({
        where: bookingFilter,
        include: {
          customer: { include: { lead: { include: { broker: true } } } },
          brokerageRecords: { include: { broker: true } },
          unit: { include: { floor: { include: { tower: { include: { project: true } } } } } },
          loanCase: true,
          agreement: true,
          possession: true
        }
      });

      let totalBookings = 0;
      let totalUnitsSold = 0;
      let totalUnitsReserved = 0;
      let totalBookingAmount = 0;
      let totalRevenue = 0;
      let totalCommission = 0;
      let totalHandoverPending = 0;
      const uniqueBrokers = new Set<string>();

      // Funnel counters
      let funnelConfirmed = 0;
      let funnelDocumentation = 0;
      let funnelLoanAgreement = 0;
      let funnelPossession = 0;
      let funnelHandover = 0;

      const projectRevenueMap = new Map<string, { revenue: number, units: number }>();
      const brokerRevenueMap = new Map<string, { name: string, revenue: number, units: number }>();

      const loanStatusMap = new Map<string, number>();
      const agreementStatusMap = new Map<string, number>();

      for (const booking of bookings) {
        totalBookings += 1;
        const bAmount = Number(booking.tokenAmount) || 0;
        const bRevenue = Number(booking.agreedPrice) || 0;
        const bComm = Number(booking.commissionAmount) || 0;

        totalBookingAmount += bAmount;
        totalRevenue += bRevenue;
        totalCommission += bComm;

        if (booking.status === 'HANDOVER_COMPLETED' || booking.possession?.status === 'HANDED_OVER') {
          totalUnitsSold += 1;
        } else {
          totalUnitsReserved += 1;
        }

        // Handover pending: possession record exists but not yet handed over
        if (booking.possession && booking.possession.status !== 'HANDED_OVER') {
          totalHandoverPending += 1;
        }

        // Brokers
        let bId = booking.customer?.lead?.brokerId;
        let bName = booking.customer?.lead?.broker?.name || 'Unknown Broker';
        if (!bId && booking.brokerageRecords.length > 0) {
          bId = booking.brokerageRecords[0].brokerId;
          bName = booking.brokerageRecords[0].broker.name;
        }
        if (bId) {
          uniqueBrokers.add(bId);
          if (!brokerRevenueMap.has(bId)) {
            brokerRevenueMap.set(bId, { name: bName, revenue: 0, units: 0 });
          }
          const bStats = brokerRevenueMap.get(bId)!;
          bStats.revenue += bRevenue;
          bStats.units += 1;
        }

        // Project
        const projName = booking.unit?.floor?.tower?.project?.name || 'Unknown Project';
        if (!projectRevenueMap.has(projName)) {
          projectRevenueMap.set(projName, { revenue: 0, units: 0 });
        }
        const pStats = projectRevenueMap.get(projName)!;
        pStats.revenue += bRevenue;
        pStats.units += 1;

        // Cumulative Funnel — derive stage from sub-entity existence/statuses
        // because booking.status may not be updated as the booking progresses.
        // Stage: CONFIRMED -> DOCUMENTATION -> LOAN/AGREEMENT -> POSSESSION -> HANDOVER
        const hasLoanOrAgreement = !!booking.loanCase || !!booking.agreement;
        const hasPossession = !!booking.possession;
        const isHandedOver = booking.possession?.status === 'HANDED_OVER' || booking.status === 'HANDOVER_COMPLETED';

        // Infer documentation stage: if any sub-entity exists, docs must have been handled
        const isDocOrLater = booking.status !== 'CONFIRMED' || hasLoanOrAgreement || hasPossession;
        const isLoanOrLater = hasLoanOrAgreement || hasPossession;
        const isPossessionOrLater = hasPossession;
        const isHandover = isHandedOver;

        funnelConfirmed += 1; // all active bookings
        if (isDocOrLater) funnelDocumentation += 1;
        if (isLoanOrLater) funnelLoanAgreement += 1;
        if (isPossessionOrLater) funnelPossession += 1;
        if (isHandover) funnelHandover += 1;

        // Loan Status
        if (booking.loanCase) {
          const lStat = booking.loanCase.status;
          loanStatusMap.set(lStat, (loanStatusMap.get(lStat) || 0) + 1);
        }

        // Agreement Status
        if (booking.agreement) {
          const aStat = booking.agreement.status;
          agreementStatusMap.set(aStat, (agreementStatusMap.get(aStat) || 0) + 1);
        }
      }

      // Follow-ups — scoped to leads in assigned CP projects for this closing manager
      const totalFollowUps = await this.prisma.followUp.count({
        where: {
          userId: userId,
          lead: { interestedProjectId: { in: cpProjectIds } },
          ...(start ? { scheduledDate: dateFilter } : {})
        }
      });

      const topWidgets = {
        totalBookings,
        totalUnitsSold,
        totalUnitsReserved,
        totalBookingAmount,
        totalRevenue,
        totalBrokers: uniqueBrokers.size,
        totalCommission,
        totalFollowUps,
        totalHandoverPending
      };

      const funnel = {
        confirmed: funnelConfirmed,
        documentation: funnelDocumentation,
        loanAgreement: funnelLoanAgreement,
        possession: funnelPossession,
        handover: funnelHandover
      };

      const projectWiseRevenue = Array.from(projectRevenueMap.entries())
        .map(([name, stats]) => ({ name, revenue: stats.revenue, unitsSold: stats.units }))
        .sort((a, b) => b.revenue - a.revenue);

      const projectWiseBookings = Array.from(projectRevenueMap.entries())
        .map(([name, stats]) => ({ name, units: stats.units }))
        .sort((a, b) => b.units - a.units);

      const brokerWiseRevenue = Array.from(brokerRevenueMap.entries())
        .map(([_, stats]) => ({ name: stats.name, revenue: stats.revenue, unitsSold: stats.units }))
        .sort((a, b) => b.revenue - a.revenue);

      const top5Brokers = brokerWiseRevenue.slice(0, 5).map((b, idx) => ({ ...b, rank: idx + 1 }));
      const mostSellingProject = projectWiseRevenue[0] || null;

      const loanStatusChart = Array.from(loanStatusMap.entries()).map(([name, value]) => ({ name, value }));
      const agreementStatusChart = Array.from(agreementStatusMap.entries()).map(([name, value]) => ({ name, value }));

      return {
        topWidgets,
        funnel,
        charts: {
          projectWiseRevenue,
          projectWiseBookings,
          brokerWiseRevenue,
          loanStatusChart,
          agreementStatusChart
        },
        top5Brokers,
        mostSellingProject
      };

    } catch (error: any) {
      console.error('Error fetching closing manager analytics:', error);
      throw new InternalServerErrorException('Failed to load analytics data');
    }
  }
}
