import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class ChannelPartnerAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(userId: string, range?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // ── Date filter ──
    const now = new Date();
    let start: Date | undefined = undefined;
    if (range === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else if (range === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'yearly') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    const dateFilter = start ? { gte: start, lte: now } : undefined;

    // ── CP Project IDs ──
    const cpProjects = await this.prisma.project.findMany({
      where: { isCpProject: true },
    });
    const cpProjectIds = cpProjects.map((p) => p.id);

    const bookingWhere: any = {
      status: { not: 'CANCELLED' },
      unit: { floor: { tower: { projectId: { in: cpProjectIds } } } },
      ...(dateFilter ? { bookingDate: dateFilter } : {}),
    };

    // ── All bookings with full relations ──
    const allBookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      include: {
        unit: {
          include: {
            floor: { include: { tower: { include: { project: true } } } },
          },
        },
        customer: { include: { lead: { include: { broker: true } } } },
        brokerageRecords: { include: { broker: true } },
        loanCase: true,
        agreement: true,
        possession: true,
        closingManager: true,
      },
    });

    // ── Section 1: Top Widgets ──
    let totalBookings = 0,
      totalUnitsSold = 0,
      totalUnitsReserved = 0;
    let totalRevenue = 0,
      totalBookingRevenue = 0,
      totalCommission = 0,
      totalHandoverPending = 0;
    const uniqueBrokersSet = new Set<string>();

    for (const b of allBookings) {
      totalBookings++;
      const isHandedOver =
        b.status === 'HANDOVER_COMPLETED' ||
        b.possession?.status === 'HANDED_OVER';
      if (isHandedOver) totalUnitsSold++;
      else totalUnitsReserved++;
      if (b.possession && b.possession.status !== 'HANDED_OVER')
        totalHandoverPending++;
      totalRevenue += Number(b.agreedPrice) || 0;
      totalBookingRevenue += Number(b.tokenAmount) || 0;
      totalCommission += Number(b.commissionAmount) || 0;
      if (b.customer?.lead?.brokerId)
        uniqueBrokersSet.add(b.customer.lead.brokerId);
      b.brokerageRecords.forEach((br) => {
        if (br.brokerId) uniqueBrokersSet.add(br.brokerId);
      });
    }

    const totalLeads = await this.prisma.lead.count({
      where: {
        brokerId: { not: null },
        interestedProjectId: { in: cpProjectIds },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    const totalSiteVisits = await this.prisma.siteVisit.count({
      where: {
        projectId: { in: cpProjectIds },
        status: 'COMPLETED',
        ...(dateFilter ? { scheduledDate: dateFilter } : {}),
      },
    });

    const topWidgets = {
      totalBookings,
      totalUnitsSold,
      totalUnitsReserved,
      totalRevenue,
      totalBookingRevenue,
      totalCommission,
      totalHandoverPending,
      totalBrokers: uniqueBrokersSet.size,
      totalLeads,
      totalSiteVisits,
    };

    // ── Section 2: Booking Funnel (cumulative, same logic as CM) ──
    let funnelConfirmed = 0,
      funnelDocumentation = 0,
      funnelLoanAgreement = 0,
      funnelPossession = 0,
      funnelHandover = 0;

    for (const b of allBookings) {
      funnelConfirmed++;
      const hasLoanOrAgreement = !!b.loanCase || !!b.agreement;
      const hasPossession = !!b.possession;
      const isHandedOver =
        b.possession?.status === 'HANDED_OVER' ||
        b.status === 'HANDOVER_COMPLETED';
      if (b.status !== 'CONFIRMED' || hasLoanOrAgreement || hasPossession)
        funnelDocumentation++;
      if (hasLoanOrAgreement || hasPossession) funnelLoanAgreement++;
      if (hasPossession) funnelPossession++;
      if (isHandedOver) funnelHandover++;
    }

    const bookingFunnel = {
      confirmed: funnelConfirmed,
      documentation: funnelDocumentation,
      loanAgreement: funnelLoanAgreement,
      possession: funnelPossession,
      handover: funnelHandover,
    };

    // ── Section 3: Revenue Charts ──
    const revenueByProject = new Map<
      string,
      { name: string; revenue: number; tokenRevenue: number; units: number }
    >();
    for (const b of allBookings) {
      const projName = b.unit?.floor?.tower?.project?.name || 'Unknown';
      if (!revenueByProject.has(projName))
        revenueByProject.set(projName, {
          name: projName,
          revenue: 0,
          tokenRevenue: 0,
          units: 0,
        });
      const s = revenueByProject.get(projName)!;
      s.revenue += Number(b.agreedPrice) || 0;
      s.tokenRevenue += Number(b.tokenAmount) || 0;
      s.units++;
    }
    const projectWiseRevenue = Array.from(revenueByProject.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const revenueTimeMap = new Map<
      string,
      { date: string; revenue: number; tokenRevenue: number }
    >();
    for (const b of allBookings) {
      const d = new Date(b.bookingDate);
      let key: string;
      if (range === 'weekly') key = d.toISOString().slice(0, 10);
      else if (range === 'monthly') key = `Week ${Math.ceil(d.getDate() / 7)}`;
      else
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueTimeMap.has(key))
        revenueTimeMap.set(key, { date: key, revenue: 0, tokenRevenue: 0 });
      const r = revenueTimeMap.get(key)!;
      r.revenue += Number(b.agreedPrice) || 0;
      r.tokenRevenue += Number(b.tokenAmount) || 0;
    }
    const revenueOverTime = Array.from(revenueTimeMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // ── Section 4: Inventory Analytics ──
    const allUnitsForCpProjects = await this.prisma.unit.findMany({
      where: { floor: { tower: { projectId: { in: cpProjectIds } } } },
      include: {
        floor: {
          include: {
            tower: { include: { project: { select: { name: true } } } },
          },
        },
      },
    });

    const inventoryByProject = new Map<
      string,
      {
        name: string;
        available: number;
        reserved: number;
        sold: number;
        blocked: number;
        total: number;
      }
    >();
    const unitTypeSoldMap = new Map<string, number>();

    for (const u of allUnitsForCpProjects) {
      const projName = u.floor?.tower?.project?.name || 'Unknown';
      if (!inventoryByProject.has(projName))
        inventoryByProject.set(projName, {
          name: projName,
          available: 0,
          reserved: 0,
          sold: 0,
          blocked: 0,
          total: 0,
        });
      const inv = inventoryByProject.get(projName)!;
      inv.total++;
      if (u.status === 'AVAILABLE') inv.available++;
      else if (u.status === 'RESERVED') inv.reserved++;
      else if (u.status === 'SOLD') {
        inv.sold++;
        unitTypeSoldMap.set(u.type, (unitTypeSoldMap.get(u.type) || 0) + 1);
      } else if (u.status === 'BLOCKED') inv.blocked++;
    }

    const inventoryPerProject = Array.from(inventoryByProject.values()).map(
      (inv) => ({
        ...inv,
        absorptionRate:
          inv.total > 0
            ? Math.round(((inv.sold + inv.reserved) / inv.total) * 100)
            : 0,
      }),
    );
    const unitTypeBreakdown = Array.from(unitTypeSoldMap.entries()).map(
      ([type, count]) => ({ name: type, value: count }),
    );

    // ── Section 5: Broker Performance ──
    const allBrokers = await this.prisma.broker.findMany({
      include: { sourcingManager: { select: { id: true, name: true } } },
    });

    const brokerBookingMap = new Map<
      string,
      {
        id: string;
        name: string;
        smName: string;
        bookings: number;
        unitsSold: number;
        commission: number;
      }
    >();
    for (const broker of allBrokers) {
      brokerBookingMap.set(broker.id, {
        id: broker.id,
        name: broker.name,
        smName: broker.sourcingManager?.name || 'Unassigned',
        bookings: 0,
        unitsSold: 0,
        commission: 0,
      });
    }

    for (const b of allBookings) {
      const isHandedOver =
        b.status === 'HANDOVER_COMPLETED' ||
        b.possession?.status === 'HANDED_OVER';
      const involvedBrokerIds = new Set<string>();
      if (b.customer?.lead?.brokerId)
        involvedBrokerIds.add(b.customer.lead.brokerId);
      b.brokerageRecords.forEach((br) => {
        if (br.brokerId) involvedBrokerIds.add(br.brokerId);
      });
      involvedBrokerIds.forEach((bId) => {
        const entry = brokerBookingMap.get(bId);
        if (entry) {
          entry.bookings++;
          if (isHandedOver) entry.unitsSold++;
          entry.commission += Number(b.commissionAmount) || 0;
        }
      });
    }

    const topBrokersAnalytics = Array.from(brokerBookingMap.values())
      .filter((b) => b.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10)
      .map((b, i) => ({ ...b, rank: i + 1 }));
    const brokerStatusDist = ['NEW', 'CONTACTED', 'VISIT', 'DEAL'].map(
      (status) => ({
        name: status,
        value: allBrokers.filter((b) => b.status === status).length,
      }),
    );
    const brokersWithBooking = Array.from(brokerBookingMap.values()).filter(
      (b) => b.bookings > 0,
    ).length;
    const brokerActivationRate =
      allBrokers.length > 0
        ? Math.round((brokersWithBooking / allBrokers.length) * 100)
        : 0;

    const newBrokerTimeMap = new Map<string, number>();
    for (const broker of allBrokers) {
      const d = new Date(broker.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      newBrokerTimeMap.set(key, (newBrokerTimeMap.get(key) || 0) + 1);
    }
    const newBrokersOverTime = Array.from(newBrokerTimeMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // ── Section 6: SM Leaderboard ──
    const sourcingManagers = await this.prisma.user.findMany({
      where: { role: { code: 'SOURCING_MANAGER' } },
      select: { id: true, name: true, username: true },
    });
    const smMeetings = await this.prisma.brokerMeeting.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: dateFilter ? { scheduledDate: dateFilter } : undefined,
    });
    const smMeetingMap = new Map(
      smMeetings.map((m) => [m.userId, m._count.id]),
    );

    const smLeaderboard = sourcingManagers.map((sm) => {
      const smBrokers = allBrokers.filter((b) => b.sourcingManagerId === sm.id);
      const smBrokerIds = smBrokers.map((b) => b.id);
      let bookingsVia = 0,
        commissionGenerated = 0;
      for (const b of allBookings) {
        const involvedBrokerIds = new Set<string>();
        if (
          b.customer?.lead?.brokerId &&
          smBrokerIds.includes(b.customer.lead.brokerId)
        )
          involvedBrokerIds.add(b.customer.lead.brokerId);
        b.brokerageRecords.forEach((br) => {
          if (smBrokerIds.includes(br.brokerId))
            involvedBrokerIds.add(br.brokerId);
        });
        if (involvedBrokerIds.size > 0) {
          bookingsVia++;
          commissionGenerated += Number(b.commissionAmount) || 0;
        }
      }
      return {
        id: sm.id,
        name: sm.name || sm.username || 'Unknown',
        activeBrokers: smBrokers.filter((b) => b.status === 'DEAL').length,
        newBrokers: smBrokers.filter((b) => b.status === 'NEW').length,
        meetings: smMeetingMap.get(sm.id) || 0,
        bookingsVia,
        commissionGenerated,
      };
    });

    // ── Section 7: CM Leaderboard ──
    const closingManagers = await this.prisma.user.findMany({
      where: { role: { code: 'CLOSING_MANAGER' } },
      select: { id: true, name: true, username: true },
    });
    const allProjectAssignments = await this.prisma.projectAssignment.findMany({
      where: { isActive: true },
    });

    const cmLeaderboard = closingManagers.map((cm) => {
      const cmProjectIds = allProjectAssignments
        .filter((a) => a.userId === cm.id)
        .map((a) => a.projectId);
      const cmBookings = allBookings.filter((b) => {
        const projId = b.unit?.floor?.tower?.projectId;
        return (
          b.closingManagerId === cm.id ||
          (projId && cmProjectIds.includes(projId))
        );
      });
      let fConfirmed = 0,
        fDoc = 0,
        fLoan = 0,
        fPossession = 0,
        fHandover = 0;
      for (const b of cmBookings) {
        fConfirmed++;
        const hasLoanOrAgreement = !!b.loanCase || !!b.agreement;
        const hasPossession = !!b.possession;
        const isHandedOver =
          b.possession?.status === 'HANDED_OVER' ||
          b.status === 'HANDOVER_COMPLETED';
        if (b.status !== 'CONFIRMED' || hasLoanOrAgreement || hasPossession)
          fDoc++;
        if (hasLoanOrAgreement || hasPossession) fLoan++;
        if (hasPossession) fPossession++;
        if (isHandedOver) fHandover++;
      }
      return {
        id: cm.id,
        name: cm.name || cm.username || 'Unknown',
        projectsAssigned: cmProjectIds.length,
        bookingsClosed: fConfirmed,
        handoversDone: fHandover,
        loanPending: cmBookings.filter(
          (b) =>
            b.loanCase &&
            !['APPROVED', 'DISBURSED'].includes(b.loanCase.status),
        ).length,
        agreementPending: cmBookings.filter(
          (b) => b.agreement && b.agreement.status !== 'COMPLETED',
        ).length,
        funnel: {
          confirmed: fConfirmed,
          documentation: fDoc,
          loanAgreement: fLoan,
          possession: fPossession,
          handover: fHandover,
        },
      };
    });

    // ── Section 8: Conversion Rates ──
    const bookingsPerProject = new Map<string, number>();
    for (const b of allBookings) {
      const projId = b.unit?.floor?.tower?.projectId;
      if (projId)
        bookingsPerProject.set(
          projId,
          (bookingsPerProject.get(projId) || 0) + 1,
        );
    }
    const leadsPerProjectRaw = await this.prisma.lead.groupBy({
      by: ['interestedProjectId'],
      where: {
        brokerId: { not: null },
        interestedProjectId: { in: cpProjectIds },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { id: true },
    });
    const leadsPerProject = new Map(
      leadsPerProjectRaw.map((l) => [l.interestedProjectId!, l._count.id]),
    );
    const conversionByProject = cpProjects.map((p) => {
      const leads = leadsPerProject.get(p.id) || 0;
      const bookings = bookingsPerProject.get(p.id) || 0;
      return {
        name: p.name,
        leads,
        bookings,
        conversionRate: leads > 0 ? Math.round((bookings / leads) * 100) : 0,
      };
    });
    const overallConversionRate =
      totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;

    // ── Section 9: Brokerage Settlement Status ──
    const brokerageSettlement: any = {
      comingSoon: true,
      pendingAmount: 0,
      paidAmount: 0,
      statusBreakdown: [],
      commissionByProject: [],
    };
    try {
      const records = await this.prisma.brokerageRecord.findMany({
        where: {
          booking: {
            unit: { floor: { tower: { projectId: { in: cpProjectIds } } } },
          },
        },
      });
      const statusMap = new Map<string, { amount: number; count: number }>();
      for (const r of records) {
        if (!statusMap.has(r.status))
          statusMap.set(r.status, { amount: 0, count: 0 });
        const s = statusMap.get(r.status)!;
        s.amount += Number(r.netPayable) || 0;
        s.count++;
        if (r.status === 'PENDING')
          brokerageSettlement.pendingAmount += Number(r.netPayable) || 0;
        if (r.status === 'PAID')
          brokerageSettlement.paidAmount += Number(r.paidAmount) || 0;
      }
      brokerageSettlement.statusBreakdown = Array.from(statusMap.entries()).map(
        ([name, v]) => ({ name, value: v.count, amount: v.amount }),
      );
      brokerageSettlement.comingSoon = false;
    } catch (_) {
      /* stay comingSoon */
    }

    // ── Section 10: Site Visit Analytics ──
    const siteVisitWhere: any = {
      projectId: { in: cpProjectIds },
      ...(dateFilter ? { scheduledDate: dateFilter } : {}),
    };
    const [svScheduled, svArrived, svCompleted] = await Promise.all([
      this.prisma.siteVisit.count({ where: siteVisitWhere }),
      this.prisma.siteVisit.count({
        where: { ...siteVisitWhere, arrivedAt: { not: null } },
      }),
      this.prisma.siteVisit.count({
        where: { ...siteVisitWhere, status: 'COMPLETED' },
      }),
    ]);
    const interestLevelRaw = await this.prisma.siteVisit.groupBy({
      by: ['interestLevel'],
      where: { ...siteVisitWhere, interestLevel: { not: null } },
      _count: { id: true },
    });
    const interestLevelBreakdown = interestLevelRaw.map((r) => ({
      name: r.interestLevel || 'UNKNOWN',
      value: r._count.id,
    }));
    const svOverTimeRaw = await this.prisma.siteVisit.findMany({
      where: siteVisitWhere,
      select: { scheduledDate: true },
    });
    const svTimeMap = new Map<string, number>();
    for (const sv of svOverTimeRaw) {
      const d = new Date(sv.scheduledDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      svTimeMap.set(key, (svTimeMap.get(key) || 0) + 1);
    }
    const siteVisitsOverTime = Array.from(svTimeMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    return {
      topWidgets,
      bookingFunnel,
      revenueCharts: { projectWiseRevenue, revenueOverTime },
      inventoryAnalytics: { inventoryPerProject, unitTypeBreakdown },
      brokerPerformance: {
        topBrokers: topBrokersAnalytics,
        brokerStatusDist,
        brokerActivationRate,
        newBrokersOverTime,
      },
      smLeaderboard: {
        table: smLeaderboard,
        contributionChart: smLeaderboard.map((sm) => ({
          name: sm.name,
          bookings: sm.bookingsVia,
        })),
      },
      cmLeaderboard: { table: cmLeaderboard },
      conversionRates: { overallConversionRate, conversionByProject },
      brokerageSettlement,
      siteVisitAnalytics: {
        svScheduled,
        svArrived,
        svCompleted,
        interestLevelBreakdown,
        siteVisitsOverTime,
      },
    };
  }
}
