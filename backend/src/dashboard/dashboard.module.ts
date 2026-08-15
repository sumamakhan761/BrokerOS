import { Module } from '@nestjs/common';
import { DashboardService } from './core/dashboard.service.js';
import { LeaderboardService } from './core/leaderboard.service.js';
import { SnapshotService } from './core/snapshot.service.js';
import { EmployeesService } from './employees/employees.service.js';
import { EmployeeCardsService } from './employees/employee-cards.service.js';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

import { BusinessManagerDashboardModule } from './business-manager/business-manager.module.js';
import { ChannelPartnerDashboardModule } from './channel-partner/channel-partner.module.js';
import { ClosingManagerDashboardModule } from './closing-manager/closing-manager.module.js';
import { PostSalesDashboardModule } from './post-sales/post-sales.module.js';
import { PreSalesDashboardModule } from './pre-sales/pre-sales.module.js';
import { SalesExecDashboardModule } from './sales-exec/sales-exec.module.js';
import { SalesManagerDashboardModule } from './sales-manager/sales-manager.module.js';
import { SourcingManagerDashboardModule } from './sourcing-manager/sourcing-manager.module.js';
import { ManagerDashboardModule } from './manager/manager.module.js';

import {
  DashboardController,
  DashboardManagerController,
  SalesManagerDashboardController,
  SalesExecDashboardController,
  PostSalesDashboardController,
  EmployeesController,
  SalesManagerEmployeesController,
  ChannelPartnerEmployeesController,
} from './core/dashboard.controller.js';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    BusinessManagerDashboardModule,
    ChannelPartnerDashboardModule,
    ClosingManagerDashboardModule,
    PostSalesDashboardModule,
    PreSalesDashboardModule,
    SalesExecDashboardModule,
    SalesManagerDashboardModule,
    SourcingManagerDashboardModule,
    ManagerDashboardModule,
  ],
  controllers: [
    DashboardController,
    DashboardManagerController,
    SalesManagerDashboardController,
    SalesExecDashboardController,
    PostSalesDashboardController,
    EmployeesController,
    SalesManagerEmployeesController,
    ChannelPartnerEmployeesController,
  ],
  providers: [
    DashboardService,
    LeaderboardService,
    SnapshotService,
    EmployeesService,
    EmployeeCardsService,
  ],
})
export class DashboardModule { }
