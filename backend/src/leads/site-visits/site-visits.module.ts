import { Module } from '@nestjs/common';
import { SiteVisitsController } from './site-visits.controller.js';
import { SiteVisitsService } from './site-visits.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
  exports: [SiteVisitsService],
})
export class SiteVisitsModule {}
