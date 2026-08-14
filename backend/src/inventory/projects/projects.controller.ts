import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('api/inventory/projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get()
  async getProjects(@Query() query: any, @Req() req: any) {
    const userId = req.user?.id;
    return this.inventoryService.getProjects(query, userId);
  }

  @Post()
  async createProject(@Body() data: any, @Req() req: any) {
    const userId = req.user?.id;
    return this.inventoryService.createProject(data, userId);
  }

  @Get(':projectId/towers')
  async getProjectTowers(@Param('projectId') projectId: string, @Req() req: any) {
    try {
      const userId = req.user?.id;
      return await this.inventoryService.getProjectTowers(projectId, userId);
    } catch (e) {
      require('fs').writeFileSync('debug-error.log', e.stack || e.message || String(e));
      throw e;
    }
  }

  @Get('towers/:towerId/assignments')
  async getTowerAssignments(@Param('towerId') towerId: string) {
    return this.inventoryService.getTowerAssignments(towerId);
  }

  @Post('towers/:towerId/assign')
  async assignTower(@Param('towerId') towerId: string, @Body() data: { sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds?: string[] }) {
    return this.inventoryService.assignTower(towerId, data.sourcingManagerIds || [], data.closingManagerIds || [], data.salesExecIds || []);
  }

  @Get(':projectId/assignments')
  async getProjectAssignments(@Param('projectId') projectId: string) {
    return this.inventoryService.getProjectAssignments(projectId);
  }

  @Post(':projectId/assign')
  async assignProject(@Param('projectId') projectId: string, @Body() data: { sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds?: string[] }) {
    return this.inventoryService.assignProject(projectId, data.sourcingManagerIds || [], data.closingManagerIds || [], data.salesExecIds || []);
  }
}
