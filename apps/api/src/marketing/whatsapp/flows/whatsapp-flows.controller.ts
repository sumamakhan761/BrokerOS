// ============================================================================
// BrokerOS — WhatsApp Flows Controller (REST API)
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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppFlowsService } from './whatsapp-flows.service.js';
import {
  CreateWhatsAppFlowDto,
  UpdateWhatsAppFlowDto,
  ListWhatsAppFlowsQueryDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/flows')
export class WhatsAppFlowsController {
  constructor(private readonly flowsService: WhatsAppFlowsService) {}

  @Get()
  async listFlows(@Query() query: ListWhatsAppFlowsQueryDto) {
    return this.flowsService.listFlows(query);
  }

  @Get(':id')
  async getFlow(@Param('id') id: string) {
    return this.flowsService.getFlow(id);
  }

  @Post()
  async createFlow(@Body() dto: CreateWhatsAppFlowDto) {
    return this.flowsService.createFlow(dto);
  }

  @Patch(':id')
  async updateFlow(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppFlowDto,
  ) {
    return this.flowsService.updateFlow(id, dto);
  }

  @Patch(':id/toggle')
  async toggleFlow(@Param('id') id: string, @Body('status') status: string) {
    return this.flowsService.toggleFlow(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFlow(@Param('id') id: string) {
    return this.flowsService.deleteFlow(id);
  }

  @Get(':id/runs')
  async getFlowRuns(
    @Param('id') id: string,
    @Query()
    query: { page?: number | string; limit?: number | string; status?: string },
  ) {
    return this.flowsService.getFlowRuns(id, query);
  }
}
