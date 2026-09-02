import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { MetaLeadsService } from '../services/meta-leads.service.js';

@Controller('api/marketing/ads/meta/webhooks')
export class MetaWebhooksController {
  constructor(private readonly metaLeadsService: MetaLeadsService) {}

  /**
   * Meta Webhook Verification Challenge handshake.
   * Meta sends GET request with `hub.mode`, `hub.verify_token`, `hub.challenge`.
   */
  @Public()
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const expectedToken =
      process.env.META_WEBHOOK_VERIFY_TOKEN || 'brokeros_meta_verify_token';

    if (
      mode === 'subscribe' &&
      (!verifyToken || verifyToken === expectedToken)
    ) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden: Invalid verification token');
  }

  /**
   * Inbound Leadgen webhook handler from Meta (Facebook & Instagram Lead Forms).
   */
  @Public()
  @Post()
  @HttpCode(200)
  async handleInboundLead(
    @Headers('x-hub-signature-256') _signature: string,
    @Body() payload: any,
  ) {
    // Process asynchronously so Meta receives 200 OK immediately
    this.metaLeadsService.processLeadgenEvent(payload).catch(() => {});

    return { status: 'EVENT_RECEIVED' };
  }
}
