import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { LeadsQueryService } from './leads-query.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { GetLeadsFilterDto } from './dto/lead.dto.js';

describe('LeadsQueryService', () => {
  let service: LeadsQueryService;
  const mockPrisma = {
    lead: { findMany: jest.fn(), findFirst: jest.fn() },
    role: { findUnique: jest.fn() },
    user: { findMany: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsQueryService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(LeadsQueryService);
  });

  it('should find all leads', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([{ id: 'l-1', siteVisits: [], followUps: [] }]);
    const res = await service.findAll({} as GetLeadsFilterDto);
    expect(res.length).toBe(1);
    expect(mockPrisma.lead.findMany).toHaveBeenCalled();
  });

  it('should filter leads for SALES_EXECUTIVE excluding confirmed/done bookings but including pending bookings', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'r-se', code: 'SALES_EXECUTIVE' });
    mockPrisma.projectAssignment.findMany.mockResolvedValue([{ projectId: 'p-1' }]);
    mockPrisma.lead.findMany.mockResolvedValue([
      { id: 'l-pending', status: 'BOOKING', subStatus: 'PENDING', siteVisits: [], followUps: [] },
    ]);

    const res = await service.findAll({ userId: 'u-se-1', roleId: 'r-se' } as GetLeadsFilterDto);

    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'BOOKING'] },
          OR: [
            { siteVisits: { some: { projectId: { in: ['p-1'] } } } },
            { assignedUserId: 'u-se-1' },
          ],
          NOT: [
            { status: 'BOOKING', subStatus: 'DONE' },
            { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
          ],
        }),
      })
    );
    expect(res.length).toBe(1);
  });

  it('should filter leads for SALES_MANAGER excluding confirmed/done bookings', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'r-sm', code: 'SALES_MANAGER' });
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'u-se-1' }, { id: 'u-se-2' }]);
    mockPrisma.lead.findMany.mockResolvedValue([]);

    await service.findAll({ userId: 'u-sm-1', roleId: 'r-sm' } as GetLeadsFilterDto);

    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'BOOKING'] },
          OR: [
            { siteVisits: { some: { salesExecId: { in: ['u-se-1', 'u-se-2'] } } } },
            { assignedUserId: { in: ['u-se-1', 'u-se-2'] } },
          ],
          NOT: [
            { status: 'BOOKING', subStatus: 'DONE' },
            { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
          ],
        }),
      })
    );
  });

  it('should allow SALES_EXECUTIVE to find a single lead even if booking is confirmed', async () => {
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'r-se', code: 'SALES_EXECUTIVE' });
    mockPrisma.lead.findFirst.mockResolvedValue({
      id: 'l-booked',
      status: 'BOOKING',
      subStatus: 'DONE',
      callRecords: [],
    });

    const res = await service.findOne('l-booked', 'u-se-1', 'r-se');
    expect(res.id).toBe('l-booked');
    expect(mockPrisma.lead.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'l-booked',
          OR: [
            { assignedUserId: 'u-se-1' },
            { siteVisits: { some: { salesExecId: 'u-se-1' } } },
            { customer: { bookings: { some: { salesExecId: 'u-se-1' } } } },
          ],
        }),
      })
    );
  });

  it('should find one lead without role restrictions when not provided', async () => {
    mockPrisma.lead.findFirst.mockResolvedValue({ id: 'l-1', callRecords: [{ id: 'c-1', recordingUrl: 'vercel-storage.com' }] });
    const res = await service.findOne('l-1');
    expect(res.id).toBe('l-1');
  });
});
