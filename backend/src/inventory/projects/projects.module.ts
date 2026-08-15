import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { InventoryProjectsService } from './inventory-projects.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ProjectsController],
  providers: [InventoryProjectsService],
  exports: [InventoryProjectsService],
})
export class ProjectsModule {}
