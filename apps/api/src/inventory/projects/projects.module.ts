import { Module } from '@nestjs/common';
import { InventoryProjectsService } from './inventory-projects.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [],
  providers: [InventoryProjectsService],
  exports: [InventoryProjectsService],
})
export class ProjectsModule {}
