import { Module } from '@nestjs/common';
import { InventoryUnitsService } from './inventory-units.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [InventoryUnitsService],
  exports: [InventoryUnitsService],
})
export class UnitsModule {}
