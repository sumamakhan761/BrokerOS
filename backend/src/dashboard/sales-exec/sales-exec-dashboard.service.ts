import { Injectable } from '@nestjs/common';
import { SalesExecWidgetsService } from './sales-exec-widgets.service.js';
import { SalesExecDailyTasksService } from './sales-exec-daily-tasks.service.js';

@Injectable()
export class SalesExecDashboardService {
  constructor(
    private salesExecWidgets: SalesExecWidgetsService,
    private salesExecDailyTasks: SalesExecDailyTasksService,
  ) {}

  async getSalesExecDashboard(userId: string) {
    const [widgets, tasksData] = await Promise.all([
      this.salesExecWidgets.getWidgets(userId),
      this.salesExecDailyTasks.getDailyTasks(userId),
    ]);

    return {
      widgets,
      dailyTasks: tasksData.dailyTasks,
      todaySiteVisitList: tasksData.todaySiteVisitList,
      backlogSiteVisitList: tasksData.backlogSiteVisitList,
      todayFollowUpList: tasksData.todayFollowUpList,
      missedFollowUpBacklog: tasksData.missedFollowUpBacklog,
    };
  }
}
