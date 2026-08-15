import { Module } from '@nestjs/common';
import { SalesManagerDashboardController, SalesManagerEmployeesController } from '../core/dashboard.controller.js';
import { SalesManagerDashboardService } from './sales-manager-dashboard.service.js';
import { SalesManagerWidgetsService } from './sales-manager-widgets.service.js';
import { SalesManagerDailyTasksService } from './sales-manager-daily-tasks.service.js';
import { SalesManagerTeamLeaderboardService } from './sales-manager-team-leaderboard.service.js';
import { SalesManagerAnalyticsService } from './sales-manager-analytics.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SalesManagerDashboardController, SalesManagerEmployeesController],
  providers: [
    SalesManagerDashboardService,
    SalesManagerWidgetsService,
    SalesManagerDailyTasksService,
    SalesManagerTeamLeaderboardService,
    SalesManagerAnalyticsService,
  ],
  exports: [
    SalesManagerDashboardService,
    SalesManagerWidgetsService,
    SalesManagerDailyTasksService,
    SalesManagerTeamLeaderboardService,
    SalesManagerAnalyticsService,
  ],
})
export class SalesManagerDashboardModule {}
