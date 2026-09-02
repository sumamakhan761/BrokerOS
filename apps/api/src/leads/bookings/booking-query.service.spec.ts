import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { BookingQueryService } from './booking-query.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('BookingQueryService', () => {
  let service: BookingQueryService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingQueryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(BookingQueryService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBooking', () => {
    it('should get a booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b-1',
        documents: [],
        notes: [],
      });
      const result = await service.getBooking('l-1');
      expect(result?.id).toEqual('b-1');
      expect(mockPrisma.booking.findFirst).toHaveBeenCalled();
    });

    it('should get all bookings for sales exec', async () => {
      mockPrisma.role.findUnique.mockResolvedValue({ code: 'SALES_EXECUTIVE' });
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'b-1' }]);
      const result = await service.getAllBookings('u-1', 'r-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ salesExecId: 'u-1' }),
        }),
      );
    });

    it('should return null if not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      expect(await service.getBooking('lead-1')).toBeNull();
    });

    it('should return mapped booking if found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b-1',
        unitId: 'u-1',
        unit: { unitNumber: '101' },
        documents: [
          {
            id: 'd-1',
            fileUrl: 'http://vercel-storage.com/d1',
            title: 'Doc',
            type: 'ID',
          },
        ],
        notes: [
          { content: JSON.stringify({ paymentMode: 'CASH', remarks: 'Good' }) },
        ],
      });
      const res = await service.getBooking('lead-1');
      expect(res).toBeDefined();
      expect(res?.paymentMode).toBe('CASH');
      expect(res?.unitDescription).toBe('Unit 101');
      expect(res?.documents[0].url).toContain(
        '/api/leads/booking-documents/d-1',
      );
    });
  });

  describe('getAllBookings', () => {
    it('should query based on roleId for SALES_EXECUTIVE', async () => {
      mockPrisma.role.findUnique.mockResolvedValue({ code: 'SALES_EXECUTIVE' });
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'booking-id' }]);
      const result = await service.getAllBookings('user-id', 'role-id');
      expect(result).toEqual([{ id: 'booking-id' }]);
    });

    it('should query bookings without assignedUserId for roles above SALES_MANAGER', async () => {
      mockPrisma.role.findUnique.mockResolvedValue({
        id: 'role-id',
        code: 'DIRECTOR',
      });
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'booking-id' }]);

      const result = await service.getAllBookings('user-id', 'role-id');
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'CONFIRMED' },
        }),
      );
    });
  });
});
