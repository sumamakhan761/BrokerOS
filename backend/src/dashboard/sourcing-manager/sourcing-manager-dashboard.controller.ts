import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SourcingManagerDashboardService } from './sourcing-manager-dashboard.service.js';
import { SourcingManagerAnalyticsService } from './sourcing-manager-analytics.service.js';

@Controller('api/dashboard/sourcing-manager')
export class SourcingManagerDashboardController {
  constructor(
    private readonly dashboardService: SourcingManagerDashboardService,
    private readonly analyticsService: SourcingManagerAnalyticsService
  ) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user?.id);
  }

  @Get('analytics')
  getAnalytics(@Req() req: any) {
    const range = req.query.range || 'all-time';
    return this.analyticsService.getAnalytics(req.user?.id, range);
  }
}
