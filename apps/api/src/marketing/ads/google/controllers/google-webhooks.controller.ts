import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { GoogleLeadsService } from '../services/google-leads.service.js';

@Controller('api/marketing/ads/google/webhooks')
export class GoogleWebhooksController {
  constructor(private readonly googleLeadsService: GoogleLeadsService) {}

  /**
   * Inbound Webhook handler for Google Ads Lead Form Asset submissions.
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleInboundLead(@Body() payload: any) {
    // Process asynchronously so Google receives 200 OK immediately
    this.googleLeadsService.processLeadWebhook(payload).catch(() => {});

    return { status: 'EVENT_RECEIVED' };
  }
}
