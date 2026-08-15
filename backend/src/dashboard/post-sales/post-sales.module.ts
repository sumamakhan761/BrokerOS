import { Module } from '@nestjs/common';
import { PostSalesDashboardController } from '../core/dashboard.controller.js';
import { PostSalesCommissionsController } from './post-sales-commissions.controller.js';
import { PostSalesDashboardService } from './post-sales-dashboard.service.js';
import { PostSalesAnalyticsService } from './post-sales-analytics.service.js';
import { PostSalesCommissionsService } from './post-sales-commissions.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PostSalesDashboardController, PostSalesCommissionsController],
  providers: [
    PostSalesDashboardService,
    PostSalesAnalyticsService,
    PostSalesCommissionsService,
  ],
  exports: [
    PostSalesDashboardService,
    PostSalesAnalyticsService,
    PostSalesCommissionsService,
  ],
})
export class PostSalesDashboardModule {}
