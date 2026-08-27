import { Module } from '@nestjs/common';
import { PrismaModule } from '../lib/database/prisma.module.js';
import { MarketingService } from './marketing.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { IntegrationsController } from './integrations.controller.js';
import { TrackingController } from './tracking.controller.js';
import { WebhooksController } from './webhooks.controller.js';
import { SampleCsvController } from './sample-csv.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    CampaignsController,
    IntegrationsController,
    TrackingController,
    WebhooksController,
    SampleCsvController,
  ],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
