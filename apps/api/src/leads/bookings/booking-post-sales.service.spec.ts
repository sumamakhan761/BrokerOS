import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ NotificationType: { RECOGNITION: 'RECOGNITION', ACHIEVEMENT_MILESTONE: 'ACHIEVEMENT_MILESTONE' }, PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');
jest.mock('@vercel/blob', () => ({ put: jest.fn().mockResolvedValue({ url: 'url' }) }));
jest.mock('fs', () => ({ writeFileSync: jest.fn() }));

import { BookingPostSalesService } from './booking-post-sales.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

describe('BookingPostSalesService', () => {
  let service: BookingPostSalesService;

  const mockPrisma = {
    loanCase: { upsert: jest.fn(), findUnique: jest.fn() },
    agreement: { upsert: jest.fn() },
    possessionHandover: { upsert: jest.fn(), update: jest.fn(), count: jest.fn() },
    booking: { findUnique: jest.fn() },
    unit: { findUnique: jest.fn(), update: jest.fn() },
    unitStatusHistory: { create: jest.fn() },
    inboundCommission: { findFirst: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
    notification: { findMany: jest.fn() }
  };
  const mockNotif = { createNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingPostSalesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotif }
      ],
    }).compile();
    service = module.get(BookingPostSalesService);
  });

  it('should save handover and process logic', async () => {
    mockPrisma.possessionHandover.upsert.mockResolvedValue({ id: 'h-1' });
    mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b-1', unitId: 'u-1', customer: { firstName: 'Test' } });
    mockPrisma.unit.findUnique.mockResolvedValue({ id: 'u-1', commissionAmount: 100 });
    mockPrisma.inboundCommission.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ role: { code: 'CLOSING_MANAGER' } });
    mockPrisma.possessionHandover.count.mockResolvedValue(10);
    mockPrisma.notification.findMany.mockResolvedValue([]);

    await service.saveHandover('b-1', { keysHandedOver: true, handoverById: 'u-1' });
    expect(mockPrisma.unit.update).toHaveBeenCalled();
    expect(mockPrisma.inboundCommission.create).toHaveBeenCalled();
    expect(mockNotif.createNotification).toHaveBeenCalled();
  });
});
