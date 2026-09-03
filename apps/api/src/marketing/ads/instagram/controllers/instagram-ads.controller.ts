import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InstagramAdsService } from '../services/instagram-ads.service.js';
import { SyncInstagramCampaignsDto } from '../dto/instagram-ads.dto.js';

@Controller('marketing/ads/instagram')
export class InstagramAdsController {
  constructor(private readonly instagramAdsService: InstagramAdsService) {}

  /**
   * Returns Instagram overview: aggregated KPIs, placement breakdown (Reels vs Stories vs Feed), and campaigns.
   */
  @Get('overview')
  async getOverview(@Query('integrationId') integrationId?: string) {
    return this.instagramAdsService.getOverview(integrationId);
  }

  /**
   * Returns Instagram active campaign list with placement badges.
   */
  @Get('campaigns')
  async getCampaigns(@Query('integrationId') integrationId?: string) {
    const overview = await this.instagramAdsService.getOverview(integrationId);
    return {
      items: overview.items,
      kpis: overview.kpis,
      placementBreakdown: overview.placementBreakdown,
    };
  }

  /**
   * Returns full Instagram campaign drill-down with 9:16 vertical creatives and real CRM leads.
   */
  @Get('campaigns/:id')
  async getCampaignDetails(@Param('id') id: string) {
    return this.instagramAdsService.getCampaignDetails(id);
  }

  /**
   * Triggers an on-demand live sync for the active Instagram ad account.
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerSync(
    @Query('integrationId') integrationId?: string,
    @Body() dto?: SyncInstagramCampaignsDto,
  ) {
    return this.instagramAdsService.triggerSync(integrationId, dto?.datePreset);
  }
}
