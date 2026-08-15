import { Module } from '@nestjs/common';
import { SalesExecDashboardService } from './sales-exec-dashboard.service.js';
import { SalesExecWidgetsService } from './sales-exec-widgets.service.js';
import { SalesExecDailyTasksService } from './sales-exec-daily-tasks.service.js';
import { SalesExecAnalyticsService } from './sales-exec-analytics.service.js';
import { SalesExecLeaderboardService } from './sales-exec-leaderboard.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    SalesExecDashboardService,
    SalesExecWidgetsService,
    SalesExecDailyTasksService,
    SalesExecAnalyticsService,
    SalesExecLeaderboardService,
  ],
  exports: [
    SalesExecDashboardService,
    SalesExecWidgetsService,
    SalesExecDailyTasksService,
    SalesExecAnalyticsService,
    SalesExecLeaderboardService,
  ],
})
export class SalesExecDashboardModule {}
