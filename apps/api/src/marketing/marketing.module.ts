import { Module } from '@nestjs/common';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { MarketingService } from './marketing.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { IntegrationsController } from './integrations.controller.js';
import { TrackingController } from './tracking.controller.js';
import { WebhooksController } from './webhooks.controller.js';
import { SampleCsvController } from './sample-csv.controller.js';
import { SmsService } from './sms.service.js';
import { SmsCampaignsController } from './sms-campaigns.controller.js';
import { SmsIntegrationsController } from './sms-integrations.controller.js';
import { SmsTrackingController } from './sms-tracking.controller.js';
import { SmsWebhooksController } from './sms-webhooks.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    CampaignsController,
    IntegrationsController,
    TrackingController,
    WebhooksController,
    SampleCsvController,
    SmsCampaignsController,
    SmsIntegrationsController,
    SmsTrackingController,
    SmsWebhooksController,
  ],
  providers: [MarketingService, SmsService],
  exports: [MarketingService, SmsService],
})
export class MarketingModule {}

