import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesExecDailyTasksService {
  constructor(private prisma: PrismaService) {}

  async getDailyTasks(userId: string) {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const [
      todayFollowUpList,
      todayFollowUpDone,
      todaySiteVisitList,
      backlogSiteVisitList,
      missedFollowUpBacklog,
    ] = await Promise.all([
      // Today's follow-up list
      this.prisma.followUp.findMany({
        where: {
          userId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
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
      // Today follow up done
      this.prisma.followUp.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Today's SV list
      this.prisma.siteVisit.findMany({
        where: {
          salesExecId: userId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          project: { select: { name: true } },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              temperature: true,
            },
          },
        },
      }),
      // SV backlog list (scheduled in the past, not completed/cancelled)
      this.prisma.siteVisit.findMany({
        where: {
          salesExecId: userId,
          scheduledDate: { lt: todayStart },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          project: { select: { name: true } },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              temperature: true,
            },
          },
        },
      }),
      // Missed follow up backlog pool
      this.prisma.followUp.findMany({
        where: {
          userId,
          status: 'MISSED',
          scheduledDate: { lt: todayStart }, // only past days
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
      }),
    ]);

    // Also fetch today's completed site visits for calculating the target correctly
    const todaySiteVisitsDone = await this.prisma.siteVisit.count({
      where: {
        salesExecId: userId,
        status: 'COMPLETED',
        completedAt: { gte: todayStart, lte: todayEnd },
      },
    });

    return {
      dailyTasks: {
        followUp: {
          target: todayFollowUpList.length + todayFollowUpDone,
          done: todayFollowUpDone,
          backlog: missedFollowUpBacklog.length,
        },
        siteVisits: {
          target: todaySiteVisitList.length + todaySiteVisitsDone,
          done: todaySiteVisitsDone,
          backlog: backlogSiteVisitList.length,
        },
      },
      todaySiteVisitList,
      backlogSiteVisitList,
      todayFollowUpList,
      missedFollowUpBacklog,
    };
  }
}
