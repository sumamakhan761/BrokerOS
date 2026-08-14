import { Injectable } from '@nestjs/common';
import { PreSalesWidgetsService } from './pre-sales-widgets.service.js';
import { PreSalesPipelineService } from './pre-sales-pipeline.service.js';
import { PreSalesDailyTasksService } from './pre-sales-daily-tasks.service.js';

@Injectable()
export class PreSalesDashboardService {
  constructor(
    private preSalesWidgets: PreSalesWidgetsService,
    private preSalesPipeline: PreSalesPipelineService,
    private preSalesDailyTasks: PreSalesDailyTasksService,
  ) {}

  async getPreSalesDashboard(userId: string) {
    // Run all data aggregation in parallel
    const [widgets, pipeline, dailyTasksData] = await Promise.all([
      this.preSalesWidgets.getWidgets(userId),
      this.preSalesPipeline.getPipeline(userId),
      this.preSalesDailyTasks.getDailyTasks(userId),
    ]);

    // Combine them into the exact same response object structure
    return {
      widgets,
      pipeline,
      dailyTasks: dailyTasksData.dailyTasks,
      backlogs: dailyTasksData.backlogs,
      todayFollowUpList: dailyTasksData.todayFollowUpList,
    };
  }
}
