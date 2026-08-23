import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesManagerDailyTasksService {
  constructor(private prisma: PrismaService) {}

  async getDailyTasks(userIds: string[]) {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const [
      todaySiteVisitList,
      todayFollowUpList,
      backlogSiteVisitList,
      missedFollowUpBacklog,
    ] = await Promise.all([
      // Today's SV list
      this.prisma.siteVisit.findMany({
        where: {
          salesExecId: { in: userIds },
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          project: { select: { name: true } },
          salesExec: { select: { id: true, name: true, username: true } },
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
      // Today's follow-up list
      this.prisma.followUp.findMany({
        where: {
          userId: { in: userIds },
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          user: { select: { id: true, name: true, username: true } },
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
      // SV backlog list
      this.prisma.siteVisit.findMany({
        where: {
          salesExecId: { in: userIds },
          scheduledDate: { lt: todayStart },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          project: { select: { name: true } },
          salesExec: { select: { id: true, name: true, username: true } },
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
          userId: { in: userIds },
          status: 'MISSED',
          scheduledDate: { lt: todayStart },
        },
        select: {
          id: true,
          scheduledDate: true,
          user: { select: { id: true, name: true, username: true } },
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

    return {
      todaySiteVisitList,
      todayFollowUpList,
      backlogSiteVisitList,
      missedFollowUpBacklog,
    };
  }
}
