import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
import { BookingService } from './booking.service.js';
import { BookingQueryService } from './booking-query.service.js';
import { BookingCreationService } from './booking-creation.service.js';
import { BookingStatusService } from './booking-status.service.js';
import { BookingDocumentsService } from './booking-documents.service.js';
import { BookingPostSalesService } from './booking-post-sales.service.js';

import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto.js';

describe('BookingService', () => {
  let service: BookingService;
  let bookingCreation: BookingCreationService;
  let bookingQuery: BookingQueryService;
  let bookingStatus: BookingStatusService;
  let bookingDocuments: BookingDocumentsService;
  let bookingPostSales: BookingPostSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: BookingQueryService, useValue: { getBooking: jest.fn(), getAllBookings: jest.fn() } },
        { provide: BookingCreationService, useValue: { createBooking: jest.fn(), updateBooking: jest.fn() } },
        { provide: BookingStatusService, useValue: { markBookingDone: jest.fn(), cancelBooking: jest.fn() } },
        { provide: BookingDocumentsService, useValue: { uploadDocument: jest.fn(), getDocumentFile: jest.fn() } },
        { provide: BookingPostSalesService, useValue: { saveLoanCase: jest.fn(), saveAgreement: jest.fn(), saveHandover: jest.fn(), uploadPostSalesFile: jest.fn() } },
      ],
    }).compile();

    service = module.get(BookingService);
    bookingCreation = module.get(BookingCreationService);
    bookingQuery = module.get(BookingQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createBooking with CreateBookingDto', async () => {
    const dto: CreateBookingDto = { userId: 'u-1', unitId: 'u-1', agreedPrice: 1000 };
    await service.createBooking('l-1', dto);
    expect(bookingCreation.createBooking).toHaveBeenCalledWith('l-1', dto);
  });

  it('should call updateBooking with UpdateBookingDto', async () => {
    const dto: UpdateBookingDto = { bookingId: 'b-1', userId: 'u-1', unitId: 'u-2' };
    await service.updateBooking('b-1', dto);
    expect(bookingCreation.updateBooking).toHaveBeenCalledWith('b-1', dto);
  });
});
