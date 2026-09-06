// ============================================================================
// BrokerOS — WhatsApp Templates Controller (REST API)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppTemplatesService } from './whatsapp-templates.service.js';
import {
  CreateWhatsAppTemplateDto,
  ListWhatsAppTemplatesQueryDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/templates')
export class WhatsAppTemplatesController {
  constructor(private readonly templatesService: WhatsAppTemplatesService) {}

  @Get()
  async listTemplates(@Query() query: ListWhatsAppTemplatesQueryDto) {
    return this.templatesService.listTemplates(query);
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Post()
  async createTemplate(@Body() dto: CreateWhatsAppTemplateDto) {
    return this.templatesService.createTemplate(dto);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncTemplates(@Body('accountId') accountId?: string) {
    return this.templatesService.syncTemplates(accountId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(@Param('id') id: string) {
    return this.templatesService.deleteTemplate(id);
  }
}
