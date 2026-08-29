import { Module } from '@nestjs/common';
import { PrismaModule } from '../lib/database/prisma.module.js';

// Email Domain
import { EmailService } from './email/email.service.js';
import { EmailAudienceService } from './email/services/email-audience.service.js';
import { EmailAnalyticsService } from './email/services/email-analytics.service.js';
import { EmailIntegrationsService } from './email/services/email-integrations.service.js';
import { EmailTrackingService } from './email/services/email-tracking.service.js';
import { EmailCampaignsController } from './email/controllers/email-campaigns.controller.js';
import { EmailIntegrationsController } from './email/controllers/email-integrations.controller.js';
import { EmailTrackingController } from './email/controllers/email-tracking.controller.js';
import { EmailWebhooksController } from './email/controllers/email-webhooks.controller.js';

// SMS Domain
import { SmsService } from './sms/sms.service.js';
import { SmsAudienceService } from './sms/services/sms-audience.service.js';
import { SmsAnalyticsService } from './sms/services/sms-analytics.service.js';
import { SmsIntegrationsService } from './sms/services/sms-integrations.service.js';
import { SmsTrackingService } from './sms/services/sms-tracking.service.js';
import { SmsCampaignsController } from './sms/controllers/sms-campaigns.controller.js';
import { SmsIntegrationsController } from './sms/controllers/sms-integrations.controller.js';
import { SmsTrackingController } from './sms/controllers/sms-tracking.controller.js';
import { SmsWebhooksController } from './sms/controllers/sms-webhooks.controller.js';

// Shared
import { SampleCsvController } from './shared/sample-csv.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    // Email Controllers
    EmailCampaignsController,
    EmailIntegrationsController,
    EmailTrackingController,
    EmailWebhooksController,

    // SMS Controllers
    SmsCampaignsController,
    SmsIntegrationsController,
    SmsTrackingController,
    SmsWebhooksController,

    // Shared Controllers
    SampleCsvController,
  ],
  providers: [
    // Email Services
    EmailAudienceService,
    EmailAnalyticsService,
    EmailIntegrationsService,
    EmailTrackingService,
    EmailService,

    // SMS Services
    SmsAudienceService,
    SmsAnalyticsService,
    SmsIntegrationsService,
    SmsTrackingService,
    SmsService,
  ],
  exports: [
    EmailService,
    EmailAudienceService,
    EmailAnalyticsService,
    EmailIntegrationsService,
    EmailTrackingService,

    SmsService,
    SmsAudienceService,
    SmsAnalyticsService,
    SmsIntegrationsService,
    SmsTrackingService,
  ],
})
export class MarketingModule {}
