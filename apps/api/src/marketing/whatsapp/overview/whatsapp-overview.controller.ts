// ============================================================================
// BrokerOS — WhatsApp Hub Overview Analytics Controller
// ============================================================================

import { Controller, Get, Query } from '@nestjs/common';
import { WhatsAppOverviewService } from './whatsapp-overview.service.js';

@Controller('api/marketing/whatsapp/overview')
export class WhatsAppOverviewController {
  constructor(private readonly overviewService: WhatsAppOverviewService) {}

  @Get()
  async getOverviewStats(@Query('accountId') accountId?: string) {
    return this.overviewService.getOverviewStats(accountId);
  }
}
