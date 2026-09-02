import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { SalesManagerWidgetsService } from './sales-manager-widgets.service.js';
import { SalesManagerDailyTasksService } from './sales-manager-daily-tasks.service.js';
import { SalesManagerTeamLeaderboardService } from './sales-manager-team-leaderboard.service.js';

@Injectable()
export class SalesManagerDashboardService {
  constructor(
    private prisma: PrismaService,
    private salesManagerWidgets: SalesManagerWidgetsService,
    private salesManagerDailyTasks: SalesManagerDailyTasksService,
    private salesManagerTeamLeaderboard: SalesManagerTeamLeaderboardService,
  ) {}

  async getSalesManagerDashboard(managerId: string) {
    // Find all subordinates
    const subs = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE' },
      select: { id: true, name: true, username: true, image: true },
    });
    const userIds = [managerId, ...subs.map((s) => s.id)];

    const [widgetsAndPipeline, dailyTasks, teamLeaderboard] = await Promise.all(
      [
        this.salesManagerWidgets.getWidgetsAndPipeline(userIds),
        this.salesManagerDailyTasks.getDailyTasks(userIds),
        this.salesManagerTeamLeaderboard.getTeamLeaderboard(subs),
      ],
    );

    return {
      widgets: widgetsAndPipeline.widgets,
      pipeline: widgetsAndPipeline.pipeline,
      teamLeaderboard,
      todaySiteVisitList: dailyTasks.todaySiteVisitList,
      backlogSiteVisitList: dailyTasks.backlogSiteVisitList,
      todayFollowUpList: dailyTasks.todayFollowUpList,
      missedFollowUpBacklog: dailyTasks.missedFollowUpBacklog,
    };
  }
}
