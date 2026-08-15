import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class { } }));
jest.mock('expo-server-sdk', () => ({ Expo: class { } }));

import { BookingQueryService } from './booking-query.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('BookingQueryService', () => {
  let service: BookingQueryService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingQueryService,
        { provide: PrismaService, useValue: mockPrisma }
      ],
    }).compile();

    service = module.get(BookingQueryService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBooking', () => {
    it('should return null if not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      expect(await service.getBooking('lead-1')).toBeNull();
    });

    it('should return mapped booking if found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b-1',
        unitId: 'u-1',
        unit: { unitNumber: '101' },
        documents: [{ id: 'd-1', fileUrl: 'http://vercel-storage.com/d1', title: 'Doc', type: 'ID' }],
        notes: [{ content: JSON.stringify({ paymentMode: 'CASH', remarks: 'Good' }) }]
      });
      const res = await service.getBooking('lead-1');
      expect(res).toBeDefined();
      expect(res?.paymentMode).toBe('CASH');
      expect(res?.unitDescription).toBe('Unit 101');
      expect(res?.documents[0].url).toContain('/api/leads/booking-documents/d-1');
    });
  });

  describe('getAllBookings', () => {
    it('should query based on roleId = 2', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      await service.getAllBookings('u-1', 2);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'CONFIRMED', salesExecId: 'u-1' }
      }));
    });

    it('should query based on roleId = 3', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      await service.getAllBookings('u-1', 3);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'CONFIRMED' }
      }));
    });
  });
});
