// ============================================================================
// BrokerOS — WhatsApp Automations Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { WhatsAppAutomationsService } from './whatsapp-automations.service.js';
import {
  CreateWhatsAppAutomationDto,
  UpdateWhatsAppAutomationDto,
  ListWhatsAppAutomationsQueryDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/automations')
export class WhatsAppAutomationsController {
  constructor(
    private readonly automationsService: WhatsAppAutomationsService,
  ) {}

  @Get()
  async listAutomations(@Query() query: ListWhatsAppAutomationsQueryDto) {
    return this.automationsService.listAutomations(query);
  }

  @Post()
  async createAutomation(
    @Body() dto: CreateWhatsAppAutomationDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id;
    return this.automationsService.createAutomation(dto, userId);
  }

  @Get(':id')
  async getAutomation(@Param('id') id: string) {
    return this.automationsService.getAutomation(id);
  }

  @Patch(':id')
  async updateAutomation(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppAutomationDto,
  ) {
    return this.automationsService.updateAutomation(id, dto);
  }

  @Delete(':id')
  async deleteAutomation(@Param('id') id: string) {
    return this.automationsService.deleteAutomation(id);
  }

  @Patch(':id/toggle')
  async toggleAutomation(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.automationsService.toggleAutomation(id, isActive);
  }

  @Get(':id/logs')
  async getLogs(
    @Param('id') id: string,
    @Query() query: { page?: string; limit?: string },
  ) {
    return this.automationsService.getLogs(id, query);
  }
}
