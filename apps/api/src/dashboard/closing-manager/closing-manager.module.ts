import { Module } from '@nestjs/common';
import { ClosingManagerDashboardController } from './closing-manager-dashboard.controller.js';
import { ClosingManagerDashboardService } from './closing-manager-dashboard.service.js';
import { ClosingManagerAnalyticsService } from './closing-manager-analytics.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ClosingManagerDashboardController],
  providers: [ClosingManagerDashboardService, ClosingManagerAnalyticsService],
  exports: [ClosingManagerDashboardService, ClosingManagerAnalyticsService],
})
export class ClosingManagerDashboardModule {}
