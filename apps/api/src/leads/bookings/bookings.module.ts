import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';
import { BookingQueryService } from './booking-query.service.js';
import { BookingCreationService } from './booking-creation.service.js';
import { BookingStatusService } from './booking-status.service.js';
import { BookingDocumentsService } from './booking-documents.service.js';
import { BookingPostSalesService } from './booking-post-sales.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';
import { PaymentsModule } from './payments/payments.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule, PaymentsModule],
  controllers: [BookingsController, BookingController],
  providers: [
    BookingService,
    BookingQueryService,
    BookingCreationService,
    BookingStatusService,
    BookingDocumentsService,
    BookingPostSalesService,
  ],
  exports: [
    BookingService,
    BookingQueryService,
    BookingCreationService,
    BookingStatusService,
    BookingDocumentsService,
    BookingPostSalesService,
  ],
})
export class BookingsModule {}
