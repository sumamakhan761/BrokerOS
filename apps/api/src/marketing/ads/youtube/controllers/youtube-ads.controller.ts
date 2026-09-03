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
import { YouTubeAdsService } from '../services/youtube-ads.service.js';
import {
  SyncYouTubeCampaignsDto,
  YouTubeCampaignQueryDto,
} from '../dto/youtube-ads.dto.js';

@Controller('api/marketing/ads/youtube')
export class YouTubeAdsController {
  constructor(private readonly youtubeAdsService: YouTubeAdsService) {}

  /**
   * Returns aggregated YouTube video KPIs, retention benchmarks, and video campaigns.
   */
  @Get('overview')
  async getOverview(@Query() query: YouTubeCampaignQueryDto) {
    return this.youtubeAdsService.getOverview(query.integrationId);
  }

  /**
   * Returns list of video campaigns.
   */
  @Get('campaigns')
  async getCampaigns(@Query() query: YouTubeCampaignQueryDto) {
    return this.youtubeAdsService.getOverview(query.integrationId);
  }

  /**
   * Returns campaign inspection with retention funnel and video leads.
   */
  @Get('campaigns/:id')
  async getCampaignDetails(@Param('id') id: string) {
    return this.youtubeAdsService.getCampaignDetails(id);
  }

  /**
   * Triggers live sync via GoogleSyncService.
   */
  @Post('integrations/:id/sync')
  @HttpCode(HttpStatus.OK)
  async syncIntegration(
    @Param('id') id: string,
    @Body() dto: SyncYouTubeCampaignsDto,
  ) {
    return this.youtubeAdsService.triggerSync(id, dto?.datePreset);
  }
}
