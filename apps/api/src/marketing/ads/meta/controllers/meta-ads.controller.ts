import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MetaAdsService } from '../services/meta-ads.service.js';
import {
  ConnectMetaIntegrationDto,
  TestMetaTokenDto,
  SyncMetaCampaignsDto,
} from '../dto/meta-ads.dto.js';

@Controller('api/marketing/ads/meta')
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Get('integrations')
  async listIntegrations() {
    return this.metaAdsService.listIntegrations();
  }

  @Post('integrations')
  async connectIntegration(@Body() dto: ConnectMetaIntegrationDto) {
    return this.metaAdsService.connectIntegration(dto);
  }

  @Delete('integrations/:id')
  async deleteIntegration(@Param('id') id: string) {
    return this.metaAdsService.deleteIntegration(id);
  }

  @Post('integrations/:id/sync')
  async syncIntegration(
    @Param('id') id: string,
    @Body() dto: SyncMetaCampaignsDto,
  ) {
    return this.metaAdsService.triggerSync(id, dto?.datePreset);
  }

  @Post('test-connection')
  async testConnection(@Body() dto: TestMetaTokenDto) {
    return this.metaAdsService.testConnection(dto);
  }

  @Get('campaigns')
  async getCampaigns(@Query('integrationId') integrationId?: string) {
    return this.metaAdsService.getCampaigns(integrationId);
  }

  @Get('campaigns/:id')
  async getCampaignDetails(@Param('id') id: string) {
    return this.metaAdsService.getCampaignDetails(id);
  }
}
