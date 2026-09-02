import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange } from '../core/dashboard.utils.js';

const DEFAULT_COLD_CALL_TARGET = 100;

@Injectable()
export class PreSalesDailyTasksService {
  constructor(private prisma: PrismaService) {}

  async getDailyTasks(userId: string) {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const {
      target: coldCallDailyTarget,
      taskId,
      taskUserId,
    } = await this.resolveColdCallTarget(userId);

    const [
      coldCallsDone,
      followUpsDone,
      coldCallBacklog,
      missedFollowUpBacklog,
      todayFollowUpTarget,
      todayFollowUpList,
    ] = await Promise.all([
      this.countColdCallsToday(userId),
      this.countFollowUpsDoneToday(userId),
      this.getColdCallBacklog(userId),
      this.getMissedFollowUpBacklog(userId),
      this.prisma.followUp.count({
        where: {
          userId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.followUp.findMany({
        where: {
          userId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
        take: 5,
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              temperature: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return {
      dailyTasks: {
        coldCall: {
          target: coldCallDailyTarget,
          done: coldCallsDone,
          backlog: coldCallBacklog,
          taskId,
          taskUserId,
        },
        followUp: {
          target: todayFollowUpTarget,
          done: followUpsDone,
          backlog: missedFollowUpBacklog.length,
        },
      },
      backlogs: {
        coldCallBacklogCount: coldCallBacklog,
        missedFollowUps: missedFollowUpBacklog,
      },
      todayFollowUpList,
    };
  }

  /** Resolves the cold call daily target and task details from an active manager task. */
  private async resolveColdCallTarget(
    userId: string,
  ): Promise<{ target: number; taskId?: string; taskUserId?: string }> {
    const assignment = await this.prisma.managerTaskUser.findFirst({
      where: { userId, task: { isActive: true } },
      include: { task: { select: { coldCallTarget: true } } },
      orderBy: { createdAt: 'desc' },
    });
    if (!assignment) return { target: DEFAULT_COLD_CALL_TARGET };
    return {
      target: assignment.targetOverride ?? assignment.task.coldCallTarget,
      taskId: assignment.taskId,
      taskUserId: assignment.id,
    };
  }

  /**
   * Count verified cold calls done by a user today.
   * Definition: lead was NEW/CONTACTED + this is the FIRST-EVER CallRecord by this user on that lead.
   */
  private async countColdCallsToday(userId: string): Promise<number> {
    const { start, end } = getTodayRange();

    const todayCallRecords = await this.prisma.callRecord.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
        leadId: { not: null },
      },
      select: { leadId: true, startedAt: true },
    });

    if (todayCallRecords.length === 0) return 0;

    let coldCallCount = 0;
    for (const record of todayCallRecords) {
      if (!record.leadId) continue;

      const lead = await this.prisma.lead.findUnique({
        where: { id: record.leadId },
        select: { status: true },
      });

      const earlierCall = await this.prisma.callRecord.findFirst({
        where: {
          userId,
          leadId: record.leadId,
          startedAt: { lt: start }, // any call before today
        },
        select: { id: true },
      });

      if (
        !earlierCall &&
        (lead?.status === 'NEW' || lead?.status === 'CONTACTED')
      ) {
        coldCallCount++;
      }
    }

    return coldCallCount;
  }

  /**
   * Count verified follow-ups completed today.
   */
  private async countFollowUpsDoneToday(userId: string): Promise<number> {
    const { start, end } = getTodayRange();

    return this.prisma.followUp.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
      },
    });
  }

  /**
   * Get the current accumulated cold call backlog for a user.
   */
  private async getColdCallBacklog(userId: string): Promise<number> {
    // 1. Check if there is an active manager task override for the backlog today
    const activeTask = await this.prisma.managerTaskUser.findFirst({
      where: { userId, task: { isActive: true } },
      orderBy: { createdAt: 'desc' },
      select: { backlogOverride: true },
    });

    if (activeTask && activeTask.backlogOverride !== null) {
      return activeTask.backlogOverride;
    }

    // 2. Otherwise calculate historically
    const logs = await this.prisma.dailyPerformanceLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (logs.length === 0) return 0;

    let totalBacklog = 0;
    for (const log of logs) {
      const shortfall = Math.max(0, log.coldCallTarget - log.coldCallsDone);
      totalBacklog += shortfall;
    }

    const totalCleared = logs.reduce(
      (sum, log) => sum + log.coldCallBacklogCleared,
      0,
    );
    return Math.max(0, totalBacklog - totalCleared);
  }

  /**
   * Get all accumulated MISSED follow-ups across all previous days (the backlog pool).
   */
  private async getMissedFollowUpBacklog(userId: string) {
    const { start } = getTodayRange();

    return this.prisma.followUp.findMany({
      where: {
        userId,
        status: 'MISSED',
        scheduledDate: { lt: start }, // only past days
      },
      select: {
        id: true,
        scheduledDate: true,
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            temperature: true,
            status: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}
