import { Module } from '@nestjs/common';
import { InventoryTowerGenService } from './inventory-tower-gen.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [InventoryTowerGenService],
  exports: [InventoryTowerGenService],
})
export class TowersModule { }
