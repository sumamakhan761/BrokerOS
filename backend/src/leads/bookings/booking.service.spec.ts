import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../generated/prisma/client.js', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
import { BookingService } from './booking.service.js';
import { BookingQueryService } from './booking-query.service.js';
import { BookingCreationService } from './booking-creation.service.js';
import { BookingStatusService } from './booking-status.service.js';
import { BookingDocumentsService } from './booking-documents.service.js';
import { BookingPostSalesService } from './booking-post-sales.service.js';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: BookingQueryService, useValue: { getBooking: jest.fn(), getAllBookings: jest.fn() } },
        { provide: BookingCreationService, useValue: { createBooking: jest.fn() } },
        { provide: BookingStatusService, useValue: { markBookingDone: jest.fn(), cancelBooking: jest.fn() } },
        { provide: BookingDocumentsService, useValue: { uploadDocument: jest.fn(), getDocumentFile: jest.fn() } },
        { provide: BookingPostSalesService, useValue: { saveLoanCase: jest.fn(), saveAgreement: jest.fn(), saveHandover: jest.fn(), uploadPostSalesFile: jest.fn() } },
      ],
    }).compile();

    service = module.get(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
