import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';
import { PrismaModule } from '../lib/database/prisma.module.js';

import { NotificationsModule } from '../notifications/notifications.module.js';
import { BookingsModule } from '../leads/bookings/bookings.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule, BookingsModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule { }
