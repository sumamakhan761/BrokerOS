import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller.js';
import { BrokersService } from './brokers.service.js';
import { BrokerActivitiesService } from './broker-activities.service.js';
import { BrokerCommissionsService } from './broker-commissions.service.js';
import { BrokerAiService } from './broker-ai.service.js';
import { TranscriptionService } from '../leads/call-records/transcription.service.js';

@Module({
  controllers: [BrokersController],
  providers: [
    BrokersService, 
    BrokerActivitiesService,
    BrokerCommissionsService,
    BrokerAiService,
    TranscriptionService
  ],
  exports: [BrokersService],
})
export class BrokersModule {}
