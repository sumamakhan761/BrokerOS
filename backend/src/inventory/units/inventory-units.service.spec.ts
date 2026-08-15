import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { InventoryUnitsService } from './inventory-units.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('InventoryUnitsService', () => {
  let service: InventoryUnitsService;
  const mockPrisma = {
    unit: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    unitStatusHistory: { create: jest.fn() },
    booking: { findFirst: jest.fn() },
    project: { update: jest.fn() },
    tower: { updateMany: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (fn) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryUnitsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(InventoryUnitsService);
  });

  it('should update unit status', async () => {
    mockPrisma.unit.findUnique.mockResolvedValue({ id: 'u-1', status: 'AVAILABLE' });
    mockPrisma.unit.update.mockResolvedValue({ id: 'u-1', status: 'RESERVED' });
    const res = await service.updateUnitStatus('u-1', { status: 'RESERVED' }, 'user-1');
    expect(res.status).toBe('RESERVED');
  });
});
