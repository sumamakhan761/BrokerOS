// ============================================================================
// BrokerOS — WhatsApp Module Coordinator Service (Facade)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppConfigService } from './config/whatsapp-config.service.js';
import { WhatsAppWebhookService } from './webhook/whatsapp-webhook.service.js';
import { WhatsAppConversationsService } from './conversations/whatsapp-conversations.service.js';
import { WhatsAppMessagesService } from './messages/whatsapp-messages.service.js';
import { WhatsAppContactsService } from './contacts/whatsapp-contacts.service.js';
import { WhatsAppBroadcastsService } from './broadcasts/whatsapp-broadcasts.service.js';
import { WhatsAppAutomationsService } from './automations/whatsapp-automations.service.js';
import { WhatsAppAutomationEngineService } from './automations/whatsapp-automation-engine.service.js';
import { WhatsAppRealtimeGateway } from './gateway/whatsapp-realtime.gateway.js';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    public readonly configService: WhatsAppConfigService,
    public readonly webhookService: WhatsAppWebhookService,
    public readonly conversationsService: WhatsAppConversationsService,
    public readonly messagesService: WhatsAppMessagesService,
    public readonly contactsService: WhatsAppContactsService,
    public readonly broadcastsService: WhatsAppBroadcastsService,
    public readonly automationsService: WhatsAppAutomationsService,
    public readonly automationEngine: WhatsAppAutomationEngineService,
    public readonly realtimeGateway: WhatsAppRealtimeGateway,
  ) {}

  /**
   * Health and readiness status for WhatsApp integration.
   */
  async getStatus() {
    const config = await this.configService.getConfig();
    return {
      connected: Boolean(config?.isActive),
      phoneNumberId: config?.phoneNumberId || null,
      displayPhone: config?.displayPhone || null,
      businessName: config?.businessName || null,
      webhookVerified: Boolean(config?.webhookVerifiedAt),
    };
  }
}
