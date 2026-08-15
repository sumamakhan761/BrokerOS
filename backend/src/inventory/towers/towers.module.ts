import { Module } from '@nestjs/common';
import { TowerGenController } from './tower-gen.controller.js';
import { InventoryTowerGenService } from './inventory-tower-gen.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TowerGenController],
  providers: [InventoryTowerGenService],
  exports: [InventoryTowerGenService],
})
export class TowersModule {}
