// ============================================================================
// BrokerOS — WhatsApp CRM Module
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../lib/database/prisma.module.js';

import { WhatsAppConfigService } from './config/whatsapp-config.service.js';
import { WhatsAppConfigController } from './config/whatsapp-config.controller.js';

import { WhatsAppWebhookService } from './webhook/whatsapp-webhook.service.js';
import { WhatsAppWebhookController } from './webhook/whatsapp-webhook.controller.js';

import { WhatsAppConversationsService } from './conversations/whatsapp-conversations.service.js';
import { WhatsAppConversationsController } from './conversations/whatsapp-conversations.controller.js';

import { WhatsAppMessagesService } from './messages/whatsapp-messages.service.js';
import { WhatsAppMessagesController } from './messages/whatsapp-messages.controller.js';

import { WhatsAppContactsService } from './contacts/whatsapp-contacts.service.js';
import { WhatsAppTagsService } from './contacts/whatsapp-tags.service.js';
import { WhatsAppQuickRepliesService } from './contacts/whatsapp-quick-replies.service.js';
import { WhatsAppContactsController } from './contacts/whatsapp-contacts.controller.js';

import { WhatsAppBroadcastsService } from './broadcasts/whatsapp-broadcasts.service.js';
import { WhatsAppBroadcastsController } from './broadcasts/whatsapp-broadcasts.controller.js';

import { WhatsAppAutomationsService } from './automations/whatsapp-automations.service.js';
import { WhatsAppAutomationsController } from './automations/whatsapp-automations.controller.js';
import { WhatsAppAutomationEngineService } from './automations/whatsapp-automation-engine.service.js';

import { WhatsAppFlowsService } from './flows/whatsapp-flows.service.js';
import { WhatsAppFlowsController } from './flows/whatsapp-flows.controller.js';
import { WhatsAppFlowEngineService } from './flows/whatsapp-flow-engine.service.js';

import { WhatsAppTemplatesService } from './templates/whatsapp-templates.service.js';
import { WhatsAppTemplatesController } from './templates/whatsapp-templates.controller.js';

import { WhatsAppAiService } from './ai/whatsapp-ai.service.js';
import { WhatsAppAiController } from './ai/whatsapp-ai.controller.js';

import { WhatsAppMediaService } from './media/whatsapp-media.service.js';
import { WhatsAppMediaController } from './media/whatsapp-media.controller.js';

import { WhatsAppOutboundWebhooksService } from './webhooks/whatsapp-outbound-webhooks.service.js';
import { WhatsAppOutboundWebhooksController } from './webhooks/whatsapp-outbound-webhooks.controller.js';

import { WhatsAppPipelinesService } from './pipelines/whatsapp-pipelines.service.js';
import { WhatsAppPipelinesController } from './pipelines/whatsapp-pipelines.controller.js';

import { WhatsAppOverviewService } from './overview/whatsapp-overview.service.js';
import { WhatsAppOverviewController } from './overview/whatsapp-overview.controller.js';

import { WhatsAppRealtimeGateway } from './gateway/whatsapp-realtime.gateway.js';
import { WhatsAppService } from './whatsapp.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    WhatsAppConfigController,
    WhatsAppWebhookController,
    WhatsAppConversationsController,
    WhatsAppMessagesController,
    WhatsAppContactsController,
    WhatsAppBroadcastsController,
    WhatsAppAutomationsController,
    WhatsAppFlowsController,
    WhatsAppTemplatesController,
    WhatsAppAiController,
    WhatsAppMediaController,
    WhatsAppOutboundWebhooksController,
    WhatsAppPipelinesController,
    WhatsAppOverviewController,
  ],
  providers: [
    WhatsAppConfigService,
    WhatsAppWebhookService,
    WhatsAppConversationsService,
    WhatsAppMessagesService,
    WhatsAppContactsService,
    WhatsAppTagsService,
    WhatsAppQuickRepliesService,
    WhatsAppBroadcastsService,
    WhatsAppAutomationsService,
    WhatsAppAutomationEngineService,
    WhatsAppFlowsService,
    WhatsAppFlowEngineService,
    WhatsAppTemplatesService,
    WhatsAppAiService,
    WhatsAppMediaService,
    WhatsAppOutboundWebhooksService,
    WhatsAppPipelinesService,
    WhatsAppOverviewService,
    WhatsAppRealtimeGateway,
    WhatsAppService,
  ],
  exports: [
    WhatsAppConfigService,
    WhatsAppWebhookService,
    WhatsAppConversationsService,
    WhatsAppMessagesService,
    WhatsAppContactsService,
    WhatsAppTagsService,
    WhatsAppQuickRepliesService,
    WhatsAppBroadcastsService,
    WhatsAppAutomationsService,
    WhatsAppAutomationEngineService,
    WhatsAppFlowsService,
    WhatsAppFlowEngineService,
    WhatsAppTemplatesService,
    WhatsAppAiService,
    WhatsAppMediaService,
    WhatsAppOutboundWebhooksService,
    WhatsAppPipelinesService,
    WhatsAppRealtimeGateway,
    WhatsAppService,
  ],
})
export class WhatsAppModule { }
