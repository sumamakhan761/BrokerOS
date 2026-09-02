import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({
  NotificationType: { BOOKING_CONFIRMED: 'BOOKING_CONFIRMED' },
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');

import { BookingCreationService } from './booking-creation.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

import { CreateBookingDto } from './dto/booking.dto.js';

describe('BookingCreationService', () => {
  let service: BookingCreationService;

  const mockPrisma = {
    lead: { findUnique: jest.fn() },
    customer: { findUnique: jest.fn(), create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (fn) => fn(mockPrisma)),
    unit: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    brokerProjectAssignment: { findUnique: jest.fn() },
    unitStatusHistory: { create: jest.fn() },
    booking: { create: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    note: { create: jest.fn() },
    user: { findMany: jest.fn() },
    broker: { findUnique: jest.fn() },
    notification: { findMany: jest.fn().mockResolvedValue([]) },
    project: { findUnique: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
  };
  const mockNotif = { createNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingCreationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotif },
      ],
    }).compile();
    service = module.get(BookingCreationService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create booking and send notifications', async () => {
    mockPrisma.lead.findUnique.mockResolvedValue({
      id: 'l-1',
      brokerId: 'br-1',
    });
    mockPrisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    mockPrisma.unit.findUnique.mockResolvedValue({
      id: 'u-1',
      status: 'AVAILABLE',
      floor: { tower: { projectId: 'p-1' } },
    });
    mockPrisma.brokerProjectAssignment.findUnique.mockResolvedValue({
      brokeragePercent: 2,
    });
    mockPrisma.booking.create.mockResolvedValue({ id: 'b-1' });
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: 'b-1',
      customer: { firstName: 'Test' },
      unit: { floor: { tower: { projectId: 'p-1' } } },
    });
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.broker.findUnique.mockResolvedValue({ id: 'br-1' });
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'p-1',
      name: 'Proj',
    });
    mockPrisma.unit.count.mockResolvedValue(10);
    mockPrisma.projectAssignment.findMany.mockResolvedValue([]);

    await service.createBooking('l-1', {
      userId: 'u-1',
      unitId: 'u-1',
      agreedPrice: 1000,
    });
    expect(mockPrisma.booking.create).toHaveBeenCalled();
    expect(mockPrisma.unit.update).toHaveBeenCalled();
  });
});
