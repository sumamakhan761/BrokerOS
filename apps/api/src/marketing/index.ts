// Module
export { MarketingModule } from './marketing.module.js';

// Email Domain
export { EmailService, EmailService as MarketingService } from './email/email.service.js';
export { EmailAudienceService } from './email/services/email-audience.service.js';
export { EmailAnalyticsService } from './email/services/email-analytics.service.js';
export { EmailIntegrationsService } from './email/services/email-integrations.service.js';
export { EmailTrackingService } from './email/services/email-tracking.service.js';
export { EmailCampaignsController } from './email/controllers/email-campaigns.controller.js';
export { EmailIntegrationsController } from './email/controllers/email-integrations.controller.js';
export { EmailTrackingController } from './email/controllers/email-tracking.controller.js';
export { EmailWebhooksController } from './email/controllers/email-webhooks.controller.js';
export * from './email/dto/email.dto.js';

// SMS Domain
export { SmsService } from './sms/sms.service.js';
export { SmsAudienceService } from './sms/services/sms-audience.service.js';
export { SmsAnalyticsService } from './sms/services/sms-analytics.service.js';
export { SmsIntegrationsService } from './sms/services/sms-integrations.service.js';
export { SmsTrackingService } from './sms/services/sms-tracking.service.js';
export { SmsCampaignsController } from './sms/controllers/sms-campaigns.controller.js';
export { SmsIntegrationsController } from './sms/controllers/sms-integrations.controller.js';
export { SmsTrackingController } from './sms/controllers/sms-tracking.controller.js';
export { SmsWebhooksController } from './sms/controllers/sms-webhooks.controller.js';
export * from './sms/dto/sms.dto.js';

// Shared
export { SampleCsvController } from './shared/sample-csv.controller.js';
