import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
import { InventoryService } from './inventory.service.js';
import { InventoryProjectsService } from '../projects/inventory-projects.service.js';
import { InventoryTowerGenService } from '../towers/inventory-tower-gen.service.js';
import { InventoryUnitsService } from '../units/inventory-units.service.js';

describe('InventoryService', () => {
  let service: InventoryService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryProjectsService,
          useValue: { getProjects: jest.fn() },
        },
        {
          provide: InventoryTowerGenService,
          useValue: { generateTowerPrompt: jest.fn() },
        },
        {
          provide: InventoryUnitsService,
          useValue: { updateUnitStatus: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getProjects with correct DTO', async () => {
    const mockQuery = { isCpProject: true };
    await service.getProjects(mockQuery, 'user-1');
    const projectsService = moduleRef.get(InventoryProjectsService);
    expect(projectsService.getProjects).toHaveBeenCalledWith(
      mockQuery,
      'user-1',
    );
  });
});
