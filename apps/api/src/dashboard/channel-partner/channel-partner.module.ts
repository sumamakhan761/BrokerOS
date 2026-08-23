import { Module } from '@nestjs/common';
import { ChannelPartnerDashboardController } from './channel-partner-dashboard.controller.js';
import { ChannelPartnerDashboardService } from './channel-partner-dashboard.service.js';
import { ChannelPartnerAnalyticsService } from './channel-partner-analytics.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ChannelPartnerDashboardController],
  providers: [
    ChannelPartnerDashboardService,
    ChannelPartnerAnalyticsService,
  ],
  exports: [
    ChannelPartnerDashboardService,
    ChannelPartnerAnalyticsService,
  ],
})
export class ChannelPartnerDashboardModule {}
