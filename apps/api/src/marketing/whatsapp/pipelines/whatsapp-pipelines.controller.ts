// ============================================================================
// BrokerOS — WhatsApp Pipelines & Deals Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import {
  WhatsAppPipelinesService,
  CreatePipelineDto,
  UpdatePipelineDto,
  CreateDealDto,
  UpdateDealDto,
} from './whatsapp-pipelines.service.js';

@Controller('api/marketing/whatsapp')
export class WhatsAppPipelinesController {
  constructor(private readonly pipelinesService: WhatsAppPipelinesService) {}

  @Get('pipelines')
  async listPipelines(@Query('accountId') accountId?: string) {
    return this.pipelinesService.listPipelines(accountId);
  }

  @Post('pipelines')
  async createPipeline(@Body() dto: CreatePipelineDto) {
    return this.pipelinesService.createPipeline(dto);
  }

  @Get('pipelines/:id')
  async getPipeline(@Param('id') id: string) {
    return this.pipelinesService.getPipeline(id);
  }

  @Patch('pipelines/:id')
  async updatePipeline(
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.updatePipeline(id, dto);
  }

  @Delete('pipelines/:id')
  async deletePipeline(@Param('id') id: string) {
    return this.pipelinesService.deletePipeline(id);
  }

  @Get('pipelines/:id/deals')
  async listDeals(@Param('id') id: string) {
    return this.pipelinesService.listDeals(id);
  }

  @Post('deals')
  async createDeal(@Body() dto: CreateDealDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.pipelinesService.createDeal(dto, undefined, userId);
  }

  @Patch('deals/:id')
  async updateDeal(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id;
    return this.pipelinesService.updateDeal(id, dto, undefined, userId);
  }

  @Delete('deals/:id')
  async deleteDeal(@Param('id') id: string) {
    return this.pipelinesService.deleteDeal(id);
  }

  @Post('deals/:id/activities')
  async addActivity(
    @Param('id') id: string,
    @Body() dto: { type: string; details?: any },
    @Req() req: any,
  ) {
    const userId = req?.user?.id;
    return this.pipelinesService.addDealActivity(id, dto, userId);
  }
}
