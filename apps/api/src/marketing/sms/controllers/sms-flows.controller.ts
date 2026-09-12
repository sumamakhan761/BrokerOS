// ============================================================================
// BrokerOS — SMS Flows Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SmsFlowsService } from '../services/sms-flows.service.js';
import { SmsInboundService } from '../services/sms-inbound.service.js';
import {
  CreateSmsFlowDto,
  UpdateSmsFlowDto,
  SimulateInboundSmsReplyDto,
} from '../dto/sms-flows.dto.js';

@Controller('api/marketing/sms/flows')
export class SmsFlowsController {
  constructor(
    private readonly flowsService: SmsFlowsService,
    private readonly inboundService: SmsInboundService,
  ) {}

  @Get()
  async findAll() {
    return this.flowsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.flowsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateSmsFlowDto) {
    return this.flowsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSmsFlowDto) {
    return this.flowsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.flowsService.delete(id);
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.flowsService.duplicate(id);
  }

  @Post(':id/clone')
  async clone(@Param('id') id: string) {
    return this.flowsService.duplicate(id);
  }

  @Get(':id/runs')
  async getFlowRuns(@Param('id') id: string) {
    return this.flowsService.getFlowRuns(id);
  }

  @Post(':id/simulate')
  async simulate(
    @Param('id') id: string,
    @Body() dto: Partial<SimulateInboundSmsReplyDto>,
  ) {
    return this.inboundService.simulateInboundReply({
      flowId: id,
      leadPhone: dto.leadPhone || '+15552345678',
      senderPhone: dto.senderPhone || '',
      bodyText: dto.bodyText || 'Tell me about pricing and site visits',
    });
  }
}
