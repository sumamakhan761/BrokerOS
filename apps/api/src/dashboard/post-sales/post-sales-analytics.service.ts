import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class PostSalesAnalyticsService {
  constructor(private prisma: PrismaService) { }

  private getDateBoundary(timeRange?: string): Date | undefined {
    if (!timeRange || timeRange === 'all-time' || timeRange === 'all') return undefined;
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

  async getPostSalesAnalytics(userId?: string, timeRange?: string, roleId?: string) {
    const startDate = this.getDateBoundary(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    let roleCode = 'ADMIN';
    if (roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (role) roleCode = role.code;
    } else if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
      if (user?.role) roleCode = user.role.code;
    }

    const leadWhere: any = { deletedAt: null };
    if (dateFilter) leadWhere.updatedAt = dateFilter;

    if (roleCode === 'POST_SALES') {
      leadWhere.customer = { bookings: { some: { assignedPostSalesId: userId, source: 'DIRECT' } } };
    } else if (roleCode === 'POST_SALES_MANAGER') {
      leadWhere.customer = { bookings: { some: { source: 'DIRECT' } } };
    }

    // 1. Funnel Data
    const funnelCounts = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { ...leadWhere, status: { in: ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'] } },
      _count: { _all: true },
    });

    const funnel = {
      booking: 0,
      document: 0,
      loan: 0,
      agreement: 0,
      handover: 0,
    };
    funnelCounts.forEach((f) => {
      if (f.status === 'BOOKING') funnel.booking = f._count._all;
      if (f.status === 'DOCUMENT') funnel.document = f._count._all;
      if (f.status === 'LOAN') funnel.loan = f._count._all;
      if (f.status === 'AGREEMENT') funnel.agreement = f._count._all;
      if (f.status === 'HANDOVER') funnel.handover = f._count._all;
    });

    // 2. Widgets Data
    const totalBooked = funnel.booking + funnel.document + funnel.loan + funnel.agreement + funnel.handover;
    const totalHandoverCompleted = await this.prisma.lead.count({
      where: { ...leadWhere, status: 'HANDOVER', subStatus: 'DONE' },
    });

    const bookingWhere: any = { status: 'CONFIRMED', ...(dateFilter && { bookingDate: dateFilter }) };
    if (roleCode === 'POST_SALES') {
      bookingWhere.assignedPostSalesId = userId;
      bookingWhere.source = 'DIRECT';
    } else if (roleCode === 'POST_SALES_MANAGER') {
      bookingWhere.source = 'DIRECT';
    }

    // Fetch confirmed bookings for revenue & commission
    const confirmedBookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      select: { agreedPrice: true, commissionAmount: true },
    });

    let totalRevenue = 0;
    let totalCommission = 0;
    confirmedBookings.forEach((b) => {
      totalRevenue += Number(b.agreedPrice || 0);
      totalCommission += Number(b.commissionAmount || 0);
    });

    const conversionRate = totalBooked > 0 ? ((totalHandoverCompleted / totalBooked) * 100).toFixed(1) : '0.0';

    const widgets = {
      totalBooked,
      totalHandoverCompleted,
      totalRevenue,
      totalCommission,
      conversionRate,
    };

    // 3. Velocity Data
    // Find bookings that have reached 'HANDOVER' status 'DONE' or have actualDate in PossessionHandover
    const possessions = await this.prisma.possessionHandover.findMany({
      where: {
        status: 'HANDED_OVER',
        actualDate: dateFilter ? { not: null, gte: startDate } : { not: null },
        booking: bookingWhere
      },
      include: { booking: true },
    });

    let totalDays = 0;
    let velocityCount = 0;
    possessions.forEach((p) => {
      if (p.actualDate && p.booking?.bookingDate) {
        const diffTime = Math.abs(p.actualDate.getTime() - p.booking.bookingDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
        velocityCount++;
      }
    });
    const averageVelocityDays = velocityCount > 0 ? Math.round(totalDays / velocityCount) : 0;

    // 4. Loan Approval Success Rate
    // Approved: Leads in AGREEMENT or HANDOVER (successful loan processing implicitly)
    // In Progress: Leads in LOAN
    // Rejected: LoanCases with status REJECTED
    const loanApproved = funnel.agreement + funnel.handover;
    const loanInProgress = funnel.loan;
    const loanRejectedCount = await this.prisma.loanCase.count({
      where: {
        status: 'REJECTED',
        ...(dateFilter && { updatedAt: dateFilter }),
        booking: bookingWhere
      },
    });

    const loanSuccessRate = {
      approved: loanApproved,
      inProgress: loanInProgress,
      rejected: loanRejectedCount,
    };

    // 5. Handover Readiness
    const possessionStats = await this.prisma.possessionHandover.groupBy({
      by: ['status'],
      where: {
        ...(dateFilter && { updatedAt: dateFilter }),
        booking: bookingWhere
      },
      _count: { _all: true },
    });

    const handoverReadiness = {
      notReady: 0,
      ready: 0,
      scheduled: 0,
      handedOver: 0,
    };

    possessionStats.forEach((p) => {
      if (p.status === 'NOT_READY') handoverReadiness.notReady = p._count._all;
      if (p.status === 'READY') handoverReadiness.ready = p._count._all;
      if (p.status === 'SCHEDULED') handoverReadiness.scheduled = p._count._all;
      if (p.status === 'HANDED_OVER') handoverReadiness.handedOver = p._count._all;
    });

    // 6. Internal Project Sales Distribution & Inventory Sell-Through
    const internalProjects = await this.prisma.project.findMany({
      where: { isCpProject: false },
      include: {
        towers: {
          include: {
            floors: {
              include: {
                units: true, // Fetch all units to calculate total vs sold
              },
            },
          },
        },
      },
    });

    const internalSalesDistribution: { projectName: string; soldUnits: number }[] = [];
    const inventorySellThrough: { projectName: string; totalUnits: number; soldUnits: number }[] = [];

    internalProjects.forEach((project: any) => {
      let totalUnits = 0;
      let soldUnits = 0;

      project.towers.forEach((tower) => {
        tower.floors.forEach((floor) => {
          floor.units.forEach((unit) => {
            totalUnits++;
            if (['RESERVED', 'SOLD'].includes(unit.status)) {
              soldUnits++;
            }
          });
        });
      });

      if (soldUnits > 0) {
        internalSalesDistribution.push({
          projectName: project.name,
          soldUnits,
        });
      }

      inventorySellThrough.push({
        projectName: project.name,
        totalUnits,
        soldUnits,
      });
    });

    // 7. Follow-up Efficiency
    const followUps = await this.prisma.followUp.groupBy({
      by: ['status'],
      where: {
        lead: {
          status: { in: ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'] },
          ...leadWhere
        },
        ...(dateFilter && { updatedAt: dateFilter })
      },
      _count: { _all: true },
    });

    const followUpEfficiency = {
      completed: 0,
      pending: 0,
    };

    followUps.forEach((f) => {
      if (f.status === 'COMPLETED') followUpEfficiency.completed = f._count._all;
      else followUpEfficiency.pending += f._count._all; // SCHEDULED, MISSED, RESCHEDULED
    });

    return {
      widgets,
      funnel,
      velocity: averageVelocityDays,
      loanSuccessRate,
      handoverReadiness,
      internalSalesDistribution,
      inventorySellThrough,
      followUpEfficiency,
    };
  }
}
