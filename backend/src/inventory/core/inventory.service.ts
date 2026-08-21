import { Injectable } from '@nestjs/common';
import { InventoryProjectsService } from '../projects/inventory-projects.service.js';
import { InventoryTowerGenService } from '../towers/inventory-tower-gen.service.js';
import { InventoryUnitsService } from '../units/inventory-units.service.js';
import { ProjectQueryDto, CreateProjectDto } from '../projects/dto/project.dto.js';
import { SaveTowerDto } from '../towers/dto/tower.dto.js';
import { UpdateUnitStatusDto, UpdatePossessionDto } from '../units/dto/unit.dto.js';

@Injectable()
export class InventoryService {
  constructor(
    private inventoryProjects: InventoryProjectsService,
    private inventoryTowerGen: InventoryTowerGenService,
    private inventoryUnits: InventoryUnitsService
  ) {}

  async getProjects(query: ProjectQueryDto, userId: string) {
    return this.inventoryProjects.getProjects(query, userId);
  }

  async createProject(data: CreateProjectDto, userId?: string) {
    return this.inventoryProjects.createProject(data, userId);
  }

  async getProjectTowers(projectId: string, userId?: string) {
    return this.inventoryProjects.getProjectTowers(projectId, userId);
  }

  async getTowerAssignments(towerId: string) {
    return this.inventoryProjects.getTowerAssignments(towerId);
  }

  async assignTower(towerId: string, sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds: string[] = []) {
    return this.inventoryProjects.assignTower(towerId, sourcingManagerIds, closingManagerIds, salesExecIds);
  }

  async getProjectAssignments(projectId: string) {
    return this.inventoryProjects.getProjectAssignments(projectId);
  }

  async assignProject(projectId: string, sourcingManagerIds: string[], closingManagerIds: string[], salesExecIds: string[] = []) {
    return this.inventoryProjects.assignProject(projectId, sourcingManagerIds, closingManagerIds, salesExecIds);
  }

  async generateTowerPrompt(projectId: string, prompt: string) {
    return this.inventoryTowerGen.generateTowerPrompt(projectId, prompt);
  }

  async saveGeneratedTower(projectId: string, towerData: SaveTowerDto) {
    return this.inventoryTowerGen.saveGeneratedTower(projectId, towerData);
  }

  async updateUnitStatus(unitId: string, data: UpdateUnitStatusDto, userId: string) {
    return this.inventoryUnits.updateUnitStatus(unitId, data, userId);
  }

  async getBookingForUnit(unitId: string) {
    return this.inventoryUnits.getBookingForUnit(unitId);
  }

  async updateProjectPossession(projectId: string, data: UpdatePossessionDto) {
    return this.inventoryUnits.updateProjectPossession(projectId, data);
  }

  async updateTowerPossession(towerId: string, data: UpdatePossessionDto) {
    return this.inventoryUnits.updateTowerPossession(towerId, data);
  }

  async updateUnitPossession(unitId: string, data: UpdatePossessionDto) {
    return this.inventoryUnits.updateUnitPossession(unitId, data);
  }
}
