import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MarketingService } from './marketing.service.js';
import { ConnectIntegrationDto } from './dto/marketing.dto.js';

@Controller('api/marketing/integrations')
export class IntegrationsController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  async list() {
    return this.marketingService.listIntegrations();
  }

  @Post()
  async connect(@Body() dto: ConnectIntegrationDto) {
    return this.marketingService.connectIntegration(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.marketingService.deleteIntegration(id);
  }
}
