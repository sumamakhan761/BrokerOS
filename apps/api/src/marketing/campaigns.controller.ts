import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { MarketingService } from './marketing.service.js';
import {
  CreateCampaignDto,
  SaveDraftCampaignDto,
  PreviewAudienceDto,
  SendTestEmailDto,
} from './dto/marketing.dto.js';

@Controller('api/marketing')
export class CampaignsController {
  constructor(private readonly marketingService: MarketingService) { }

  @Get('projects')
  async getProjects() {
    return this.marketingService.getProjects();
  }

  @Post('audience-preview')
  async previewAudience(@Body() dto: PreviewAudienceDto) {
    return this.marketingService.previewAudience(dto);
  }

  @Get('campaigns')
  async findAll(@Query() query: { page?: number; limit?: number; status?: string; search?: string }) {
    return this.marketingService.findAllCampaigns(query);
  }

  @Post('campaigns/draft')
  async saveDraft(@Req() req: any, @Body() dto: SaveDraftCampaignDto) {
    return this.marketingService.saveDraftCampaign(dto, req.user?.id);
  }

  @Post('campaigns')
  async create(@Req() req: any, @Body() dto: CreateCampaignDto) {
    return this.marketingService.createCampaign(dto, req.user?.id);
  }

  @Get('campaigns/:id')
  async findOne(@Param('id') id: string) {
    return this.marketingService.findOneCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  async getAnalytics(@Param('id') id: string) {
    return this.marketingService.getCampaignAnalytics(id);
  }

  @Get('campaigns/:id/recipients')
  async getRecipients(
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.marketingService.getCampaignRecipients(id, query);
  }

  @Post('campaigns/send-test')
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    return this.marketingService.sendTestEmail(dto);
  }

  @Post('campaigns/:id/dispatch')
  async dispatchCampaign(@Param('id') id: string) {
    return this.marketingService.dispatchCampaign(id);
  }

  @Post('recipients/:recipientId/promote')
  async promoteRecipient(@Req() req: any, @Param('recipientId') recipientId: string) {
    return this.marketingService.promoteCsvRecipientToLead(recipientId, req.user?.id);
  }
}
