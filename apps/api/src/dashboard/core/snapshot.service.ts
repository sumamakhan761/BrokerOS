import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

// Fallback target when no manager task is assigned to an agent
const DEFAULT_COLD_CALL_TARGET = 100;


/**
 * Owns the midnight cron and daily performance snapshot logic.
 * Implements OnModuleInit so the timer is set up automatically on boot.
 */
@Injectable()
export class SnapshotService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  onModuleInit() {
    // Schedule midnight cron using pure Node.js timers (no @nestjs/schedule needed)
    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    };

    const scheduleMidnight = () => {
      setTimeout(() => {
        this.midnightDailySnapshot().catch(console.error);
        setInterval(() => {
          this.midnightDailySnapshot().catch(console.error);
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight());
    };

    scheduleMidnight();
    console.log('[SnapshotService] Midnight snapshot scheduled.');
  }

  async midnightDailySnapshot() {
    console.log('[DailySnapshot] Starting midnight performance snapshot...');

    // Get yesterday's date (the day that just ended)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get all active pre-sales users
    const preSalesRole = await this.prisma.role.findFirst({
      where: { code: 'PRE_SALES' },
      select: { id: true },
    });

    if (!preSalesRole) {
      console.log('[DailySnapshot] No PRE_SALES role found, skipping.');
      return;
    }

    const agents = await this.prisma.user.findMany({
      where: { roleId: preSalesRole.id, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    });

    for (const agent of agents) {
      try {
        await this.processAgentSnapshot(agent.id, yesterday, yesterdayEnd);
      } catch (err) {
        console.error(`[DailySnapshot] Error processing agent ${agent.id}:`, err);
      }
    }

    console.log(`[DailySnapshot] Done. Processed ${agents.length} agents.`);
  }

  private async processAgentSnapshot(userId: string, dayStart: Date, dayEnd: Date) {
    // 1. Count cold calls done yesterday
    const callRecordsYesterday = await this.prisma.callRecord.findMany({
      where: {
        userId,
        startedAt: { gte: dayStart, lte: dayEnd },
        leadId: { not: null },
      },
      select: { leadId: true },
    });

    let coldCallsDone = 0;
    for (const record of callRecordsYesterday) {
      if (!record.leadId) continue;
      const earlierCall = await this.prisma.callRecord.findFirst({
        where: {
          userId,
          leadId: record.leadId,
          startedAt: { lt: dayStart },
        },
        select: { id: true },
      });
      if (!earlierCall) coldCallsDone++;
    }

    // 2. Count follow-ups done yesterday
    const followUpsDone = await this.prisma.followUp.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: dayStart, lte: dayEnd },
      },
    });

    // 3. Find follow-ups scheduled yesterday that are still SCHEDULED → mark MISSED
    const missedFollowUps = await this.prisma.followUp.findMany({
      where: {
        userId,
        scheduledDate: { gte: dayStart, lte: dayEnd },
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
      },
      select: { id: true },
    });

    if (missedFollowUps.length > 0) {
      await this.prisma.followUp.updateMany({
        where: { id: { in: missedFollowUps.map((f) => f.id) } },
        data: { status: 'MISSED' },
      });
    }

    // 4. Get previous backlog carried in
    const prevLog = await this.prisma.dailyPerformanceLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const prevBacklogIn = prevLog
      ? Math.max(0, prevLog.coldCallBacklogIn - prevLog.coldCallBacklogCleared + (prevLog.coldCallTarget - prevLog.coldCallsDone))
      : 0;

    // 5. How much backlog was cleared yesterday?
    let backlogIn = prevLog
      ? Math.max(0, prevLog.coldCallBacklogIn + Math.max(0, prevLog.coldCallTarget - prevLog.coldCallsDone) - prevLog.coldCallBacklogCleared)
      : 0;

    const activeAssignment = await this.prisma.managerTaskUser.findFirst({
      where: { userId, task: { isActive: true } },
      orderBy: { createdAt: 'desc' }
    });

    if (activeAssignment) {
      if (activeAssignment.backlogOverride !== null) {
        backlogIn = activeAssignment.backlogOverride;
      }
      
      // CLEAR the overrides so it resumes computing normally tomorrow
      await this.prisma.managerTaskUser.update({
        where: { id: activeAssignment.id },
        data: { backlogOverride: null, targetOverride: null }
      });
    }

    const coldCallTarget = await this.resolveColdCallTarget(userId);

    // Prioritize today's task first
    const actualDailyCallsDone = Math.min(coldCallTarget, coldCallsDone);
    
    // Any surplus goes towards clearing the backlog
    const surplusCalls = Math.max(0, coldCallsDone - coldCallTarget);
    const coldCallBacklogCleared = Math.min(backlogIn, surplusCalls);

    // 6. Follow-up target = how many were scheduled yesterday
    const followUpTarget = await this.prisma.followUp.count({
      where: {
        userId,
        scheduledDate: { gte: dayStart, lte: dayEnd },
      },
    });

    // 7. Write DailyPerformanceLog
    await this.prisma.dailyPerformanceLog.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      create: {
        userId,
        date: dayStart,
        coldCallTarget,

        coldCallsDone,
        coldCallBacklogIn: backlogIn,
        coldCallBacklogCleared,
        followUpTarget,
        followUpsDone,
        missedFollowUpIds: missedFollowUps.map((f) => f.id),
      },
      update: {
        coldCallsDone,
        coldCallBacklogIn: backlogIn,
        coldCallBacklogCleared,
        followUpsDone,
        missedFollowUpIds: missedFollowUps.map((f) => f.id),
      },
    });
  }

  /** Reads the active manager task target for an employee, falls back to default. */
  private async resolveColdCallTarget(userId: string): Promise<number> {
    const assignment = await this.prisma.managerTaskUser.findFirst({
      where: { userId, task: { isActive: true } },
      include: { task: { select: { coldCallTarget: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return assignment?.task.coldCallTarget ?? DEFAULT_COLD_CALL_TARGET;
  }
}
