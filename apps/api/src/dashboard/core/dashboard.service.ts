import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { PreSalesDashboardService } from '../pre-sales/pre-sales-dashboard.service.js';
import { ManagerDashboardService } from '../manager/manager-dashboard.service.js';
import { LeaderboardService } from './leaderboard.service.js';
import { SalesExecDashboardService } from '../sales-exec/sales-exec-dashboard.service.js';
import { getTodayRange } from './dashboard.utils.js';

/**
 * Thin orchestrator — delegates to focused sub-services.
 * The controller only ever talks to this service, keeping the public API stable.
 */
@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private preSalesDashboard: PreSalesDashboardService,
    private managerDashboard: ManagerDashboardService,
    private leaderboard: LeaderboardService,
    private salesExecDashboard: SalesExecDashboardService,
  ) {}

  getPreSalesDashboard(userId: string) {
    return this.preSalesDashboard.getPreSalesDashboard(userId);
  }

  getPreSalesManagerDashboard(managerId: string) {
    return this.managerDashboard.getPreSalesManagerDashboard(managerId);
  }

  getPreSalesManagerAnalytics(managerId: string, timeRange?: string) {
    return this.managerDashboard.getPreSalesManagerAnalytics(
      managerId,
      timeRange,
    );
  }

  getLeaderboard(userId: string) {
    return this.leaderboard.getLeaderboard(userId);
  }

  getManagerLeaderboard(managerId: string) {
    return this.leaderboard.getManagerLeaderboard(managerId);
  }

  getSalesExecDashboard(userId: string) {
    return this.salesExecDashboard.getSalesExecDashboard(userId);
  }

  getSalesExecLeaderboard(userId: string) {
    return this.leaderboard.getSalesExecLeaderboard(userId);
  }

  // ─── Confirm Follow-up ────────────────────────────────────────────────────
  // Small enough to stay here — it's a single atomic action with no sub-concerns.

  async confirmFollowUp(
    followUpId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const { start, end } = getTodayRange();

    const followUp = await this.prisma.followUp.findUnique({
      where: { id: followUpId },
      select: { id: true, leadId: true, userId: true, status: true },
    });

    if (!followUp) {
      return { success: false, message: 'Follow-up not found' };
    }

    if (followUp.userId !== userId) {
      return {
        success: false,
        message: 'You are not authorized to confirm this follow-up',
      };
    }

    if (followUp.status === 'COMPLETED') {
      return { success: false, message: 'Follow-up is already completed' };
    }

    if (!followUp.leadId) {
      return { success: false, message: 'Follow-up has no associated lead' };
    }

    // Verify: does a CallRecord exist for TODAY from this user to this lead?
    const callRecordToday = await this.prisma.callRecord.findFirst({
      where: {
        userId,
        leadId: followUp.leadId,
        startedAt: { gte: start, lte: end },
      },
      select: { id: true },
    });

    if (!callRecordToday) {
      return {
        success: false,
        message:
          'No call record found for today. You must call the lead before confirming the follow-up.',
      };
    }

    await this.prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { success: true, message: 'Follow-up confirmed successfully' };
  }
}
