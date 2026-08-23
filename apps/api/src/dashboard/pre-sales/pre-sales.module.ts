import { Module } from '@nestjs/common';
import { PreSalesDashboardService } from './pre-sales-dashboard.service.js';
import { PreSalesWidgetsService } from './pre-sales-widgets.service.js';
import { PreSalesPipelineService } from './pre-sales-pipeline.service.js';
import { PreSalesDailyTasksService } from './pre-sales-daily-tasks.service.js';
import { PreSalesAnalyticsService } from './pre-sales-analytics.service.js';
import { PreSalesLeaderboardService } from './pre-sales-leaderboard.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    PreSalesDashboardService,
    PreSalesWidgetsService,
    PreSalesPipelineService,
    PreSalesDailyTasksService,
    PreSalesAnalyticsService,
    PreSalesLeaderboardService,
  ],
  exports: [
    PreSalesDashboardService,
    PreSalesWidgetsService,
    PreSalesPipelineService,
    PreSalesDailyTasksService,
    PreSalesAnalyticsService,
    PreSalesLeaderboardService,
  ],
})
export class PreSalesDashboardModule { }
