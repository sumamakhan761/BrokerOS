import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { EmailService } from '../email.service.js';
import {
  CreateCampaignDto,
  SaveDraftCampaignDto,
  PreviewAudienceDto,
  SendTestEmailDto,
} from '../dto/email.dto.js';

@Controller('api/marketing')
export class EmailCampaignsController {
  constructor(private readonly emailService: EmailService) { }

  @Get('projects')
  async getProjects() {
    return this.emailService.getProjects();
  }

  @Post('audience-preview')
  async previewAudience(@Body() dto: PreviewAudienceDto) {
    return this.emailService.previewAudience(dto);
  }

  @Get('campaigns')
  async findAll(@Query() query: { page?: number; limit?: number; status?: string; search?: string; includeDrafts?: string | boolean }) {
    return this.emailService.findAllCampaigns(query);
  }

  @Post('campaigns/draft')
  async saveDraft(@Req() req: any, @Body() dto: SaveDraftCampaignDto) {
    return this.emailService.saveDraftCampaign(dto, req.user?.id);
  }

  @Post('campaigns')
  async create(@Req() req: any, @Body() dto: CreateCampaignDto) {
    return this.emailService.createCampaign(dto, req.user?.id);
  }

  @Get('campaigns/:id')
  async findOne(@Param('id') id: string) {
    return this.emailService.findOneCampaign(id);
  }

  @Delete('campaigns/:id')
  async delete(@Param('id') id: string) {
    return this.emailService.deleteCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  async getAnalytics(@Param('id') id: string) {
    return this.emailService.getCampaignAnalytics(id);
  }

  @Get('campaigns/:id/recipients')
  async getRecipients(
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.emailService.getCampaignRecipients(id, query);
  }

  @Post('campaigns/send-test')
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    return this.emailService.sendTestEmail(dto);
  }

  @Post('campaigns/:id/dispatch')
  async dispatchCampaign(@Param('id') id: string) {
    return this.emailService.dispatchCampaign(id);
  }

  @Post('recipients/:recipientId/promote')
  async promoteRecipient(@Req() req: any, @Param('recipientId') recipientId: string) {
    return this.emailService.promoteCsvRecipientToLead(recipientId, req.user?.id);
  }
}
