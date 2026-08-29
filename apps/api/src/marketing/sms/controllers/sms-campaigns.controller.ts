import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { SmsService } from '../sms.service.js';
import {
  CreateSmsCampaignDto,
  SaveDraftSmsCampaignDto,
  PreviewSmsAudienceDto,
  SendTestSmsDto,
} from '../dto/sms.dto.js';

@Controller('api/marketing/sms')
export class SmsCampaignsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('projects')
  async getProjects() {
    return this.smsService.getProjects();
  }

  @Post('audience-preview')
  async previewAudience(@Body() dto: PreviewSmsAudienceDto) {
    return this.smsService.previewAudience(dto);
  }

  @Post('campaigns/draft')
  async saveDraft(@Body() dto: SaveDraftSmsCampaignDto, @Req() req: any) {
    const userId = req?.user?.id || req?.session?.userId;
    return this.smsService.saveDraftCampaign(dto, userId);
  }

  @Post('campaigns')
  async createCampaign(@Body() dto: CreateSmsCampaignDto, @Req() req: any) {
    const userId = req?.user?.id || req?.session?.userId;
    return this.smsService.createCampaign(dto, userId);
  }

  @Get('campaigns')
  async findAll(@Query() query: { page?: number; limit?: number; status?: string; search?: string; includeDrafts?: string | boolean }) {
    return this.smsService.findAllCampaigns(query);
  }

  @Get('campaigns/:id')
  async findOne(@Param('id') id: string) {
    return this.smsService.findOneCampaign(id);
  }

  @Delete('campaigns/:id')
  async delete(@Param('id') id: string) {
    return this.smsService.deleteCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  async getAnalytics(@Param('id') id: string) {
    return this.smsService.getCampaignAnalytics(id);
  }

  @Get('campaigns/:id/recipients')
  async getRecipients(
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.smsService.getCampaignRecipients(id, query);
  }

  @Post('campaigns/send-test')
  async sendTestSms(@Body() dto: SendTestSmsDto) {
    return this.smsService.sendTestSms(dto);
  }

  @Post('campaigns/:id/dispatch')
  async dispatchCampaign(@Param('id') id: string) {
    return this.smsService.dispatchCampaign(id);
  }

  @Post('recipients/:id/promote')
  async promoteRecipient(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id || req?.session?.userId;
    return this.smsService.promoteCsvRecipientToLead(id, userId);
  }
}
