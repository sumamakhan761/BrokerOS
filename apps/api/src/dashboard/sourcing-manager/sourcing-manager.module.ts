import { Module } from '@nestjs/common';
import { SourcingManagerDashboardController } from './sourcing-manager-dashboard.controller.js';
import { SourcingManagerDashboardService } from './sourcing-manager-dashboard.service.js';
import { SourcingManagerAnalyticsService } from './sourcing-manager-analytics.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SourcingManagerDashboardController],
  providers: [
    SourcingManagerDashboardService,
    SourcingManagerAnalyticsService,
  ],
  exports: [
    SourcingManagerDashboardService,
    SourcingManagerAnalyticsService,
  ],
})
export class SourcingManagerDashboardModule {}
