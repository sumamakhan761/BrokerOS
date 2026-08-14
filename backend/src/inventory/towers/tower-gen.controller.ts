import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('api/inventory/projects')
@UseGuards(AuthGuard)
export class TowerGenController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Post(':projectId/towers/ai-generate')
  async generateTowerPrompt(@Param('projectId') projectId: string, @Body('prompt') prompt: string) {
    return this.inventoryService.generateTowerPrompt(projectId, prompt);
  }

  @Post(':projectId/towers')
  async saveGeneratedTower(@Param('projectId') projectId: string, @Body() towerData: any) {
    return this.inventoryService.saveGeneratedTower(projectId, towerData);
  }
}
