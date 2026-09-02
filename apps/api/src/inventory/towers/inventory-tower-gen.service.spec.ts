import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: '{"name": "A"}' } }],
        }),
      },
    },
  }));
});

import { InventoryTowerGenService } from './inventory-tower-gen.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { SaveTowerDto, UnitTypeEnum } from './dto/tower.dto.js';

describe('InventoryTowerGenService', () => {
  let service: InventoryTowerGenService;
  const mockPrisma = {
    tower: { create: jest.fn() },
    floor: { create: jest.fn() },
    unit: { createMany: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (fn) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    process.env.GROQ_API_KEY = 'test';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTowerGenService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(InventoryTowerGenService);
  });

  it('should generate tower prompt', async () => {
    const res = await service.generateTowerPrompt('p-1', 'prompt');
    expect(res).toEqual({ name: 'A' });
  });

  it('should save generated tower', async () => {
    mockPrisma.tower.create.mockResolvedValue({ id: 't-1' });
    mockPrisma.floor.create.mockResolvedValue({ id: 'f-1' });
    mockPrisma.unit.createMany.mockResolvedValue({ count: 1 });
    const dto = {
      name: 'A',
      floors: [
        {
          floorNumber: 1,
          units: [
            { type: UnitTypeEnum.SHOP, unitNumber: '101', basePrice: 100 },
          ],
        },
      ],
    } as SaveTowerDto;
    const res = await service.saveGeneratedTower('p-1', dto);
    expect(res.id).toBe('t-1');
  });
});
