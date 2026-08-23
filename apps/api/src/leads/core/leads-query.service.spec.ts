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

  it('should find one lead', async () => {
    mockPrisma.lead.findFirst.mockResolvedValue({ id: 'l-1', callRecords: [{ id: 'c-1', recordingUrl: 'vercel-storage.com' }] });
    const res = await service.findOne('l-1');
    expect(res.id).toBe('l-1');
  });
});
