import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { BrokersService } from './brokers.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';
import { UpdateDealCardDto } from './dto/broker.dto.js';

describe('BrokersService', () => {
  let service: BrokersService;
  const mockPrisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    broker: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
    towerAssignment: { findMany: jest.fn() },
    brokerProjectAssignment: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrokersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(BrokersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get brokers', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', role: { code: 'SOURCING_MANAGER' } });
    mockPrisma.broker.findMany.mockResolvedValue([{ id: 'b-1' }]);
    const res = await service.getBrokers('u-1');
    expect(res.length).toBe(1);
  });

  it('should get broker by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', role: { code: 'SOURCING_MANAGER' } });
    mockPrisma.broker.findUnique.mockResolvedValue({ id: 'b-1' });
    const res = await service.getBrokerById('b-1', 'u-1');
    expect(res.id).toBe('b-1');
  });

  it('should update deal card', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', role: { code: 'SOURCING_MANAGER' } });
    mockPrisma.broker.findUnique.mockResolvedValue({ id: 'b-1', status: 'DEAL' });
    mockPrisma.brokerProjectAssignment.findFirst.mockResolvedValue(null);
    mockPrisma.brokerProjectAssignment.create.mockResolvedValue({ id: 'a-1' });
    const dto = { projectId: 'p-1' } as UpdateDealCardDto;
    const res = await service.updateDealCard('b-1', 'u-1', dto);
    expect(res.id).toBe('a-1');
  });
});
