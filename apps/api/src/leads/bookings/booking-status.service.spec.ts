import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class { }, NotificationType: { LEAD_ASSIGNED: 'LEAD_ASSIGNED' } }));
jest.mock('expo-server-sdk', () => ({ Expo: class { } }));

import { BookingStatusService } from './booking-status.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

describe('BookingStatusService', () => {
  let service: BookingStatusService;

  const mockPrisma = {
    booking: { findUnique: jest.fn(), update: jest.fn() },
    customer: { findUnique: jest.fn() },
    lead: { findUnique: jest.fn(), update: jest.fn() },
    brokerProjectAssignment: { findUnique: jest.fn() },
    brokerageRecord: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (fn) => fn(mockPrisma)),
    unit: { update: jest.fn() },
    unitStatusHistory: { create: jest.fn() },
    role: { findFirst: jest.fn() },
    user: { findMany: jest.fn() }
  };
  
  const mockNotif = { createNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingStatusService, 
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotif }
      ],
    }).compile();
    service = module.get(BookingStatusService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should mark booking done', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b-1', customerId: 'c-1', agreedPrice: 100000, unit: { floor: { tower: { projectId: 'p-1' } } } });
    mockPrisma.booking.update.mockResolvedValue({ id: 'b-1' });
    mockPrisma.customer.findUnique.mockResolvedValue({ leadId: 'l-1' });
    mockPrisma.lead.findUnique.mockResolvedValue({ id: 'l-1', brokerId: 'br-1' });
    mockPrisma.brokerProjectAssignment.findUnique.mockResolvedValue({ brokeragePercent: 5 });
    mockPrisma.brokerageRecord.findFirst.mockResolvedValue(null);

    await service.markBookingDone('b-1');
    expect(mockPrisma.booking.update).toHaveBeenCalled();
    expect(mockPrisma.lead.update).toHaveBeenCalled();
    expect(mockPrisma.brokerageRecord.create).toHaveBeenCalled();
  });

  it('should cancel booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b-1', unitId: 'u-1', status: 'CONFIRMED' });
    mockPrisma.booking.update.mockResolvedValue({ id: 'b-1' });
    await service.cancelBooking('b-1');
    expect(mockPrisma.unit.update).toHaveBeenCalled();
    expect(mockPrisma.unitStatusHistory.create).toHaveBeenCalled();
  });
});
