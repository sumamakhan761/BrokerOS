import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { EmailService } from '../email.service.js';
import { ConnectIntegrationDto } from '../dto/email.dto.js';

@Controller('api/marketing/integrations')
export class EmailIntegrationsController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async list() {
    return this.emailService.listIntegrations();
  }

  @Post()
  async connect(@Body() dto: ConnectIntegrationDto) {
    return this.emailService.connectIntegration(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.emailService.deleteIntegration(id);
  }
}
