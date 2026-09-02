import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { UpdateUnitStatusDto, UpdatePossessionDto } from './dto/unit.dto.js';

@Controller('api/inventory')
@UseGuards(AuthGuard)
export class UnitsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch('units/:unitId/status')
  async updateUnitStatus(
    @Param('unitId') unitId: string,
    @Body() data: UpdateUnitStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.inventoryService.updateUnitStatus(unitId, data, userId);
  }

  @Get('units/:unitId/booking')
  async getBookingForUnit(@Param('unitId') unitId: string) {
    return this.inventoryService.getBookingForUnit(unitId);
  }

  @Patch('projects/:projectId/possession')
  async updateProjectPossession(
    @Param('projectId') projectId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateProjectPossession(projectId, data);
  }

  @Patch('towers/:towerId/possession')
  async updateTowerPossession(
    @Param('towerId') towerId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateTowerPossession(towerId, data);
  }

  @Patch('units/:unitId/possession')
  async updateUnitPossession(
    @Param('unitId') unitId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateUnitPossession(unitId, data);
  }
}
