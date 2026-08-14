import { Module } from '@nestjs/common';
import { LeadsService } from './core/leads.service.js';
import { LeadsController } from './core/leads.controller.js';
import { BookingsController } from './bookings/bookings.controller.js';
import { NotesController } from './notes/notes.controller.js';
import { FollowUpsController } from './follow-ups/follow-ups.controller.js';
import { SiteVisitsController } from './site-visits/site-visits.controller.js';
import { CallRecordsController } from './call-records/call-records.controller.js';
import { CallStatusController } from './call-records/call-status.controller.js';
import { BookingController } from './bookings/booking.controller.js';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { TranscriptionService } from './call-records/transcription.service.js';
import { NotesService } from './notes/notes.service.js';
import { FollowUpsService } from './follow-ups/follow-ups.service.js';
import { SiteVisitsService } from './site-visits/site-visits.service.js';
import { CallRecordsService } from './call-records/call-records.service.js';
import { BookingService } from './bookings/booking.service.js';
import { BookingQueryService } from './bookings/booking-query.service.js';
import { BookingCreationService } from './bookings/booking-creation.service.js';
import { BookingStatusService } from './bookings/booking-status.service.js';
import { BookingDocumentsService } from './bookings/booking-documents.service.js';
import { BookingPostSalesService } from './bookings/booking-post-sales.service.js';
import { LeadsQueryService } from './core/leads-query.service.js';
import { LeadsManagementService } from './core/leads-management.service.js';
import { LeadsMediaService } from './core/leads-media.service.js';
import { PaymentsModule } from './bookings/payments/payments.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, PaymentsModule, NotificationsModule],
  controllers: [
    LeadsController,
    BookingsController,
    NotesController,
    FollowUpsController,
    SiteVisitsController,
    CallRecordsController,
    CallStatusController,
    BookingController
  ],
  providers: [
    LeadsService,
    TranscriptionService,
    NotesService,
    FollowUpsService,
    SiteVisitsService,
    CallRecordsService,
    BookingService,
    BookingQueryService,
    BookingCreationService,
    BookingStatusService,
    BookingDocumentsService,
    BookingPostSalesService,
    LeadsQueryService,
    LeadsManagementService,
    LeadsMediaService,
  ],
})
export class LeadsModule { }
