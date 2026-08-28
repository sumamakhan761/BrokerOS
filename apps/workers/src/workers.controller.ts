import { Controller, Post, Body, Get } from '@nestjs/common';
import { MarketingEmailProcessor } from './processors/marketing-email.processor.js';

@Controller()
export class WorkersController {
  constructor(private readonly marketingEmailProcessor: MarketingEmailProcessor) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', worker: 'BrokerOS Async Workers' };
  }

  @Post('dispatch')
  async dispatchCampaign(@Body() body: { campaignId: string }) {
    if (body.campaignId) {
      // Trigger execution in background without blocking HTTP response
      this.marketingEmailProcessor.processCampaign({ campaignId: body.campaignId }).catch((err) => {
        console.error('Worker dispatch error:', err);
      });
    }
    return { success: true, message: `Dispatched campaign ${body.campaignId}` };
  }
}
