// ============================================================================
// BrokerOS — WhatsApp Outbound Webhook Endpoints Controller (REST API)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppOutboundWebhooksService } from './whatsapp-outbound-webhooks.service.js';

@Controller('api/marketing/whatsapp/webhooks/endpoints')
export class WhatsAppOutboundWebhooksController {
  constructor(
    private readonly outboundWebhooksService: WhatsAppOutboundWebhooksService,
  ) {}

  @Get()
  async listEndpoints(@Query('accountId') accountId: string) {
    return this.outboundWebhooksService.listEndpoints(accountId);
  }

  @Post()
  async createEndpoint(
    @Query('accountId') accountId: string,
    @Body() body: { url: string; secret: string; events: string[] },
  ) {
    return this.outboundWebhooksService.createEndpoint(accountId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteEndpoint(
    @Param('id') id: string,
    @Query('accountId') accountId: string,
  ) {
    return this.outboundWebhooksService.deleteEndpoint(id, accountId);
  }
}
