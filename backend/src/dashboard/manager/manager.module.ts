import { Module } from '@nestjs/common';
import { DashboardManagerController, EmployeesController } from '../core/dashboard.controller.js';
import { ManagerDashboardService } from './manager-dashboard.service.js';
import { ManagerTasksService } from './manager-tasks.service.js';
import { ManagerAnnouncementsService } from './manager-announcements.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DashboardManagerController, EmployeesController],
  providers: [
    ManagerDashboardService,
    ManagerTasksService,
    ManagerAnnouncementsService,
  ],
  exports: [
    ManagerDashboardService,
    ManagerTasksService,
    ManagerAnnouncementsService,
  ],
})
export class ManagerDashboardModule {}
