// ============================================================================
// BrokerOS — Email Flows Controller
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
import { EmailFlowsService } from '../services/email-flows.service.js';
import { EmailInboundService } from '../services/email-inbound.service.js';
import { CreateEmailFlowDto, UpdateEmailFlowDto, SimulateInboundReplyDto } from '../dto/email-flows.dto.js';

@Controller('api/marketing/email/flows')
export class EmailFlowsController {
  constructor(
    private readonly flowsService: EmailFlowsService,
    private readonly inboundService: EmailInboundService,
  ) { }

  @Get()
  async findAll() {
    return this.flowsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.flowsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateEmailFlowDto) {
    return this.flowsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmailFlowDto) {
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
  async simulate(@Param('id') id: string, @Body() dto: Partial<SimulateInboundReplyDto>) {
    return this.inboundService.simulateInboundReply({
      flowId: id,
      leadEmail: dto.leadEmail || 'prospect-tester@example.com',
      senderEmail: dto.senderEmail || 'sales@brokeros.com',
      subject: dto.subject || 'Inquiry regarding property and visit',
      bodyText: dto.bodyText || '',
    });
  }
}
