import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'url' }),
}));

import { BrokerCommissionsService } from './broker-commissions.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';

describe('BrokerCommissionsService', () => {
  let service: BrokerCommissionsService;
  const mockPrisma = {
    user: { findUnique: jest.fn() },
    brokerageRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokerCommissionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(BrokerCommissionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get commissions', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u-1',
      role: { code: 'SOURCING_MANAGER' },
    });
    mockPrisma.brokerageRecord.findMany.mockResolvedValue([{ id: 'c-1' }]);
    const res = await service.getCommissions('u-1');
    expect(res.length).toBe(1);
  });

  it('should complete commission', async () => {
    mockPrisma.brokerageRecord.findUnique.mockResolvedValue({
      id: 'c-1',
      netPayable: 100,
    });
    mockPrisma.brokerageRecord.update.mockResolvedValue({
      id: 'c-1',
      status: 'PAID',
    });
    const res = await service.completeCommission('c-1', 'u-1');
    expect(res.status).toBe('PAID');
  });
});
