import { Controller, Post, Param, Headers, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { VoiceTrackingService } from '../services/voice-tracking.service.js';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { VoiceAgentPlatform } from '@brokeros/types';

@Controller('api/marketing/voice/webhooks')
export class VoiceWebhooksController {
  constructor(private readonly trackingService: VoiceTrackingService) { }

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
