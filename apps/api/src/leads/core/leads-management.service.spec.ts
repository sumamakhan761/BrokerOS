import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({
  NotificationType: { LEAD_ASSIGNED: 'LEAD_ASSIGNED' },
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');

import { LeadsManagementService } from './leads-management.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { CreateLeadDto } from './dto/lead.dto.js';

describe('LeadsManagementService', () => {
  let service: LeadsManagementService;
  const mockPrisma = {
    leadSource: { findMany: jest.fn(), findFirst: jest.fn() },
    project: { findMany: jest.fn() },
    lead: {
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: { findMany: jest.fn() },
    booking: { findFirst: jest.fn() },
    unit: { update: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (fn) => fn(mockPrisma)),
  };
  const mockNotifs = { createNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsManagementService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifs },
      ],
    }).compile();
    service = module.get(LeadsManagementService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should bulk create leads', async () => {
    mockPrisma.leadSource.findMany.mockResolvedValue([]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.lead.createMany.mockResolvedValue({ count: 2 });
    await service.bulkCreate(
      [{ firstName: 'A' }, { firstName: 'B' }] as CreateLeadDto[],
      'm-1',
    );
    expect(mockPrisma.lead.createMany).toHaveBeenCalled();
    expect(mockNotifs.createNotification).toHaveBeenCalled();
  });

  it('should assign leads round robin', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'u-1' }, { id: 'u-2' }]);
    await service.assignLeads(['l-1', 'l-2'], 'm-1', undefined, true);
    expect(mockPrisma.lead.update).toHaveBeenCalledTimes(2);
  });
});
