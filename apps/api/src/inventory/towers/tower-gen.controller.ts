import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { GenerateTowerPromptDto, SaveTowerDto } from './dto/tower.dto.js';

@Controller('api/inventory/projects')
@UseGuards(AuthGuard)
export class TowerGenController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':projectId/towers/ai-generate')
  async generateTowerPrompt(
    @Param('projectId') projectId: string,
    @Body() data: GenerateTowerPromptDto,
  ) {
    return this.inventoryService.generateTowerPrompt(projectId, data.prompt);
  }

  @Post(':projectId/towers')
  async saveGeneratedTower(
    @Param('projectId') projectId: string,
    @Body() towerData: SaveTowerDto,
  ) {
    return this.inventoryService.saveGeneratedTower(projectId, towerData);
  }
}
