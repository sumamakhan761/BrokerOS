import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller.js';
import { InventoryUnitsService } from './inventory-units.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [UnitsController],
  providers: [InventoryUnitsService],
  exports: [InventoryUnitsService],
})
export class UnitsModule {}
