import { Module } from '@nestjs/common';
import { LeadsService } from './core/leads.service.js';
import { LeadsController } from './core/leads.controller.js';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { LeadsQueryService } from './core/leads-query.service.js';
import { LeadsManagementService } from './core/leads-management.service.js';
import { LeadsMediaService } from './core/leads-media.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

import { BookingsModule } from './bookings/bookings.module.js';
import { CallRecordsModule } from './call-records/call-records.module.js';
import { FollowUpsModule } from './follow-ups/follow-ups.module.js';
import { NotesModule } from './notes/notes.module.js';
import { SiteVisitsModule } from './site-visits/site-visits.module.js';
import { NegotiationsModule } from './negotiations/negotiations.module.js';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    BookingsModule,
    CallRecordsModule,
    FollowUpsModule,
    NotesModule,
    SiteVisitsModule,
    NegotiationsModule,
  ],
  controllers: [
    LeadsController,
  ],
  providers: [
    LeadsService,
    LeadsQueryService,
    LeadsManagementService,
    LeadsMediaService,
  ],
})
export class LeadsModule { }
