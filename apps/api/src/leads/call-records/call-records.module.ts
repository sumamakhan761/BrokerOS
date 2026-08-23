import { Module } from '@nestjs/common';
import { CallRecordsController } from './call-records.controller.js';
import { CallStatusController } from './call-status.controller.js';
import { CallRecordsService } from './call-records.service.js';
import { TranscriptionService } from './transcription.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CallRecordsController, CallStatusController],
  providers: [CallRecordsService, TranscriptionService],
  exports: [CallRecordsService, TranscriptionService],
})
export class CallRecordsModule {}
