// ============================================================================
// BrokerOS — WhatsApp Webhook Controller (Meta Verification & Inbound Events)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppWebhookService } from './whatsapp-webhook.service.js';

@Controller('api/marketing/whatsapp/webhook')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly configService: WhatsAppConfigService,
    private readonly webhookService: WhatsAppWebhookService,
  ) { }

  /**
   * Meta Webhook Verification Handshake.
   * Responds to Meta GET request with `hub.challenge`.
   */
  @Public()
  @Get()
  verifyChallenge(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const validChallenge = this.configService.verifyWebhook(
      mode,
      verifyToken,
      challenge,
    );
    return res.status(HttpStatus.OK).send(validChallenge);
  }

  /**
   * Meta Inbound Webhook Event Receiver.
   * Handles incoming customer messages and delivery/read status updates.
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleInboundPayload(
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() payload: any,
  ) {
    // Optional HMAC signature verification if Meta App Secret is configured
    if (process.env.WA_APP_SECRET || process.env.META_APP_SECRET) {
      const rawString =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
      const isValid = this.webhookService.verifySignature(rawString, signature);
      if (!isValid) {
        this.logger.warn(
          '[webhook] Inbound request rejected: invalid HMAC signature',
        );
        throw new UnauthorizedException('Invalid signature');
      }
    }

    // Process asynchronously so Meta receives 200 OK immediately
    this.webhookService.handleMetaPayload(payload).catch((err) => {
      this.logger.error(`Webhook processing error: ${err?.message}`);
    });

    return { status: 'received' };
  }
}
