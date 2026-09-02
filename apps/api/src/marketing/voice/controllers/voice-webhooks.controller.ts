import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Body,
  Query,
  Header,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { VoiceTrackingService } from '../services/voice-tracking.service.js';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { VoiceAgentPlatform } from '@brokeros/types';

@Public()
@Controller('api/marketing/voice/webhooks')
export class VoiceWebhooksController {
  constructor(private readonly trackingService: VoiceTrackingService) {}

  @Get('vobiz-answer')
  @Post('vobiz-answer')
  @Header('Content-Type', 'text/xml')
  handleVobizAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('firstMessage') firstMessage?: string,
    @Query('scriptPrompt') scriptPrompt?: string,
    @Query('agent') agentPlatform?: string,
    @Query('voice') voiceId?: string,
    @Res() res?: Response,
  ) {
    const publicUrl = process.env.API_PUBLIC_URL || '';
    const wsUrl = publicUrl.replace(/^http/, 'ws') + '/voice/stream';

    // Vobiz / Plivo Bidirectional Real-time WebSocket Audio Stream
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream bidirectional="true" keepCallAlive="true" contentType="audio/x-mulaw;rate=8000">
    ${wsUrl}
  </Stream>
</Response>`;

    if (res) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(xml);
    }
    return xml;
  }

  @Get('twilio-answer')
  @Post('twilio-answer')
  @Header('Content-Type', 'text/xml')
  handleTwilioAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('firstMessage') firstMessage?: string,
    @Res() res?: Response,
  ) {
    const publicUrl = process.env.API_PUBLIC_URL || '';
    const wsUrl = publicUrl.replace(/^http/, 'ws') + '/voice/stream';

    // Twilio Bidirectional Media Stream
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="campaignId" value="${campaignId || 'direct_call'}"/>
    </Stream>
  </Connect>
</Response>`;

    if (res) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(xml);
    }
    return xml;
  }

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') providerName: string,
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const platform = providerName.toUpperCase() as VoiceAgentPlatform;

    try {
      const provider = getVoiceAgentProvider(platform);
      const events = provider.parseWebhookEvent(headers, body);

      if (events.length > 0) {
        await this.trackingService.processWebhookEvents(events);
      }

      return { success: true, processed: events.length };
    } catch {
      return { success: true };
    }
  }
}
