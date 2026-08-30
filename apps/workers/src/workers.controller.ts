import { Controller, Post, Body, Get } from '@nestjs/common';
import { MarketingEmailProcessor } from './processors/marketing-email.processor.js';
import { MarketingSmsProcessor } from './processors/marketing-sms.processor.js';
import { MarketingVoiceProcessor } from './processors/marketing-voice.processor.js';

@Controller()
export class WorkersController {
  constructor(
    private readonly marketingEmailProcessor: MarketingEmailProcessor,
    private readonly marketingSmsProcessor: MarketingSmsProcessor,
    private readonly marketingVoiceProcessor: MarketingVoiceProcessor,
  ) { }

  @Get('health')
  getHealth() {
    return { status: 'ok', worker: 'BrokerOS Async Workers' };
  }

  @Post('dispatch')
  async dispatchEmailCampaign(@Body() body: { campaignId: string }) {
    if (body.campaignId) {
      this.marketingEmailProcessor.processCampaign({ campaignId: body.campaignId }).catch((err) => {
        console.error('Email worker dispatch error:', err);
      });
    }
    return { success: true, message: `Dispatched email campaign ${body.campaignId}` };
  }

  @Post('dispatch-sms')
  async dispatchSmsCampaign(@Body() body: { campaignId: string }) {
    if (body.campaignId) {
      this.marketingSmsProcessor.processSmsCampaign({ campaignId: body.campaignId }).catch((err) => {
        console.error('SMS worker dispatch error:', err);
      });
    }
    return { success: true, message: `Dispatched SMS campaign ${body.campaignId}` };
  }

  @Post('dispatch-voice')
  async dispatchVoiceCampaign(@Body() body: { campaignId: string }) {
    if (body.campaignId) {
      this.marketingVoiceProcessor.processVoiceCampaign({ campaignId: body.campaignId }).catch((err) => {
        console.error('Voice worker dispatch error:', err);
      });
    }
    return { success: true, message: `Dispatched Voice campaign ${body.campaignId}` };
  }
}


