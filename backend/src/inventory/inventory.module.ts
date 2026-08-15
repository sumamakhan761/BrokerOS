import { Module } from '@nestjs/common';
import { InventoryService } from './core/inventory.service.js';
import { PrismaModule } from '../lib/database/prisma.module.js';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TowersModule } from './towers/towers.module.js';
import { UnitsModule } from './units/units.module.js';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    DocumentsModule,
    ProjectsModule,
    TowersModule,
    UnitsModule,
  ],
  controllers: [],
  providers: [
    InventoryService,
  ],
  exports: [InventoryService],
})
export class InventoryModule { }
