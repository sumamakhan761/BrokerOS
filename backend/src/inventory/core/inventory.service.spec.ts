import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
import { InventoryService } from './inventory.service.js';
import { InventoryProjectsService } from '../projects/inventory-projects.service.js';
import { InventoryTowerGenService } from '../towers/inventory-tower-gen.service.js';
import { InventoryUnitsService } from '../units/inventory-units.service.js';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: InventoryProjectsService, useValue: { getProjects: jest.fn() } },
        { provide: InventoryTowerGenService, useValue: { generateTowerPrompt: jest.fn() } },
        { provide: InventoryUnitsService, useValue: { updateUnitStatus: jest.fn() } },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
