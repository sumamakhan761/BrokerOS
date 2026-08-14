import { Module } from '@nestjs/common';
import { InventoryService } from './core/inventory.service.js';
import { ProjectsController } from './projects/projects.controller.js';
import { TowerGenController } from './towers/tower-gen.controller.js';
import { UnitsController } from './units/units.controller.js';
import { InventoryProjectsService } from './projects/inventory-projects.service.js';
import { InventoryTowerGenService } from './towers/inventory-tower-gen.service.js';
import { InventoryUnitsService } from './units/inventory-units.service.js';
import { DocumentsController } from './documents/documents.controller.js';
import { DocumentsService } from './documents/documents.service.js';
import { PrismaModule } from '../lib/database/prisma.module.js';

import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ProjectsController, TowerGenController, UnitsController, DocumentsController],
  providers: [
    InventoryService,
    InventoryProjectsService,
    InventoryTowerGenService,
    InventoryUnitsService,
    DocumentsService
  ],
  exports: [InventoryService, DocumentsService],
})
export class InventoryModule { }
