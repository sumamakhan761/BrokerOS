import { Module } from '@nestjs/common';
import { BusinessManagerDashboardController } from './business-manager-dashboard.controller.js';
import { BusinessManagerDashboardService } from './business-manager-dashboard.service.js';
import { BusinessManagerAnalyticsService } from './business-manager-analytics.service.js';
import { BusinessManagerInventoryService } from './business-manager-inventory.service.js';
import { BusinessManagerFinancialsService } from './business-manager-financials.service.js';
import { BusinessManagerEmployeesService } from './business-manager-employees.service.js';
import { BusinessManagerLeadsService } from './business-manager-leads.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessManagerDashboardController],
  providers: [
    BusinessManagerDashboardService,
    BusinessManagerAnalyticsService,
    BusinessManagerInventoryService,
    BusinessManagerFinancialsService,
    BusinessManagerEmployeesService,
    BusinessManagerLeadsService,
  ],
  exports: [
    BusinessManagerDashboardService,
    BusinessManagerAnalyticsService,
    BusinessManagerInventoryService,
    BusinessManagerFinancialsService,
    BusinessManagerEmployeesService,
    BusinessManagerLeadsService,
  ],
})
export class BusinessManagerDashboardModule { }
