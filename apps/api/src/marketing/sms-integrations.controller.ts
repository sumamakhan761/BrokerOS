import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SmsService } from './sms.service.js';
import { ConnectSmsIntegrationDto } from './dto/sms.dto.js';

@Controller('api/marketing/sms/integrations')
export class SmsIntegrationsController {
  constructor(private readonly smsService: SmsService) {}

  @Get()
  async list() {
    return this.smsService.listIntegrations();
  }

  @Post()
  async connect(@Body() dto: ConnectSmsIntegrationDto) {
    return this.smsService.connectIntegration(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.smsService.deleteIntegration(id);
  }
}
