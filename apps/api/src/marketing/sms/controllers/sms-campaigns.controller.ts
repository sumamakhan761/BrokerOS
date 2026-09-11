import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { SmsService } from '../sms.service.js';
import {
  CreateSmsCampaignDto,
  SaveDraftSmsCampaignDto,
  PreviewSmsAudienceDto,
  SendTestSmsDto,
  CalculateSmsCostEstimateDto,
  BulkAssignSmsLeadsDto,
  ExportSmsLeadsDto,
} from '../dto/sms.dto.js';

@Controller('api/marketing/sms')
export class SmsCampaignsController {
  constructor(private readonly smsService: SmsService) { }

  @Get('projects')
  async getProjects() {
    return this.smsService.getProjects();
  }

  @Post('campaigns/cost-estimate')
  async calculateCostEstimate(@Body() dto: CalculateSmsCostEstimateDto) {
    return this.smsService.calculateCostEstimate(dto);
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
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      includeDrafts?: string | boolean;
    },
  ) {
    const list = await this.smsService.findAllCampaigns(query);
    return {
      items: list,
      total: Array.isArray(list) ? list.length : 0,
    };
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
    @Query()
    query: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      engagement?: string;
      crmStatus?: string;
    },
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

  @Post('campaigns/leads/bulk-assign')
  async bulkAssignLeads(@Req() req: any, @Body() dto: BulkAssignSmsLeadsDto) {
    const userId = req?.user?.id || req?.session?.userId;
    return this.smsService.bulkAssignRecipientsToCrm(dto, userId);
  }

  @Post('campaigns/leads/export-data')
  async exportLeadsData(@Body() dto: ExportSmsLeadsDto) {
    return this.smsService.getExportLeadsData(dto);
  }

  @Post('recipients/:id/promote')
  async promoteRecipient(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id || req?.session?.userId;
    return this.smsService.promoteCsvRecipientToLead(id, userId);
  }
}
