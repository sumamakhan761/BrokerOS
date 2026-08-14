import { Module } from '@nestjs/common';
import { DashboardController, DashboardManagerController, EmployeesController, SalesExecDashboardController, SalesManagerDashboardController, SalesManagerEmployeesController, PostSalesDashboardController, ChannelPartnerEmployeesController } from './core/dashboard.controller.js';
import { SourcingManagerDashboardController } from './sourcing-manager/sourcing-manager-dashboard.controller.js';
import { DashboardService } from './core/dashboard.service.js';
import { PostSalesDashboardService } from './post-sales/post-sales-dashboard.service.js';
import { PostSalesAnalyticsService } from './post-sales/post-sales-analytics.service.js';
import { PostSalesCommissionsService } from './post-sales/post-sales-commissions.service.js';
import { PostSalesCommissionsController } from './post-sales/post-sales-commissions.controller.js';
import { PreSalesDashboardService } from './pre-sales/pre-sales-dashboard.service.js';
import { PreSalesWidgetsService } from './pre-sales/pre-sales-widgets.service.js';
import { PreSalesPipelineService } from './pre-sales/pre-sales-pipeline.service.js';
import { PreSalesDailyTasksService } from './pre-sales/pre-sales-daily-tasks.service.js';
import { PreSalesAnalyticsService } from './pre-sales/pre-sales-analytics.service.js';
import { ManagerDashboardService } from './manager/manager-dashboard.service.js';
import { SalesExecDashboardService } from './sales-exec/sales-exec-dashboard.service.js';
import { SalesExecWidgetsService } from './sales-exec/sales-exec-widgets.service.js';
import { SalesExecDailyTasksService } from './sales-exec/sales-exec-daily-tasks.service.js';
import { SalesExecAnalyticsService } from './sales-exec/sales-exec-analytics.service.js';
import { SalesManagerDashboardService } from './sales-manager/sales-manager-dashboard.service.js';
import { SalesManagerWidgetsService } from './sales-manager/sales-manager-widgets.service.js';
import { SalesManagerDailyTasksService } from './sales-manager/sales-manager-daily-tasks.service.js';
import { SalesManagerTeamLeaderboardService } from './sales-manager/sales-manager-team-leaderboard.service.js';
import { SalesManagerAnalyticsService } from './sales-manager/sales-manager-analytics.service.js';
import { LeaderboardService } from './core/leaderboard.service.js';
import { PreSalesLeaderboardService } from './pre-sales/pre-sales-leaderboard.service.js';
import { SalesExecLeaderboardService } from './sales-exec/sales-exec-leaderboard.service.js';
import { SnapshotService } from './core/snapshot.service.js';
import { EmployeesService } from './employees/employees.service.js';
import { EmployeeCardsService } from './employees/employee-cards.service.js';
import { ManagerTasksService } from './manager/manager-tasks.service.js';
import { ManagerAnnouncementsService } from './manager/manager-announcements.service.js';
import { SourcingManagerDashboardService } from './sourcing-manager/sourcing-manager-dashboard.service.js';
import { SourcingManagerAnalyticsService } from './sourcing-manager/sourcing-manager-analytics.service.js';
import { ClosingManagerDashboardController } from './closing-manager/closing-manager-dashboard.controller.js';
import { ClosingManagerDashboardService } from './closing-manager/closing-manager-dashboard.service.js';
import { ClosingManagerAnalyticsService } from './closing-manager/closing-manager-analytics.service.js';
import { ChannelPartnerDashboardController } from './channel-partner/channel-partner-dashboard.controller.js';
import { ChannelPartnerDashboardService } from './channel-partner/channel-partner-dashboard.service.js';
import { ChannelPartnerAnalyticsService } from './channel-partner/channel-partner-analytics.service.js';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { BusinessManagerDashboardService } from './business-manager/business-manager-dashboard.service.js';
import { BusinessManagerAnalyticsService } from './business-manager/business-manager-analytics.service.js';
import { BusinessManagerInventoryService } from './business-manager/business-manager-inventory.service.js';
import { BusinessManagerFinancialsService } from './business-manager/business-manager-financials.service.js';
import { BusinessManagerEmployeesService } from './business-manager/business-manager-employees.service.js';
import { BusinessManagerLeadsService } from './business-manager/business-manager-leads.service.js';
import { BusinessManagerDashboardController } from './business-manager/business-manager-dashboard.controller.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DashboardController, DashboardManagerController, EmployeesController, SalesExecDashboardController, SalesManagerDashboardController, SalesManagerEmployeesController, PostSalesDashboardController, SourcingManagerDashboardController, ClosingManagerDashboardController, ChannelPartnerEmployeesController, ChannelPartnerDashboardController, PostSalesCommissionsController, BusinessManagerDashboardController],
  providers: [
    DashboardService,
    PreSalesDashboardService,
    PreSalesWidgetsService,
    PreSalesPipelineService,
    PreSalesDailyTasksService,
    PreSalesAnalyticsService,
    ManagerDashboardService,
    SalesExecDashboardService,
    SalesExecWidgetsService,
    SalesExecDailyTasksService,
    SalesExecAnalyticsService,
    SalesManagerDashboardService,
    SalesManagerWidgetsService,
    SalesManagerDailyTasksService,
    SalesManagerTeamLeaderboardService,
    SalesManagerAnalyticsService,
    PostSalesDashboardService,
    PostSalesAnalyticsService,
    PostSalesCommissionsService,
    LeaderboardService,
    PreSalesLeaderboardService,
    SalesExecLeaderboardService,
    SnapshotService,
    EmployeesService,
    EmployeeCardsService,
    ManagerTasksService,
    ManagerAnnouncementsService,
    SourcingManagerDashboardService,
    SourcingManagerAnalyticsService,
    ClosingManagerDashboardService,
    ClosingManagerAnalyticsService,
    ChannelPartnerDashboardService,
    ChannelPartnerAnalyticsService,
    BusinessManagerDashboardService,
    BusinessManagerAnalyticsService,
    BusinessManagerInventoryService,
    BusinessManagerFinancialsService,
    BusinessManagerEmployeesService,
    BusinessManagerLeadsService,
  ],
})
export class DashboardModule { }
