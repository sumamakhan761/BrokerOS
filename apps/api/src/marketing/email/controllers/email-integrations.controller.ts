import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { EmailService } from '../email.service.js';
import {
  ConnectIntegrationDto,
  AddSenderDomainDto,
  UpdateSenderDomainDto,
} from '../dto/email.dto.js';

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

  @Get('domains')
  async listDomains() {
    return this.emailService.listAllActiveSenderDomains();
  }

  @Post(':id/sync-domains')
  async syncDomains(@Param('id') id: string) {
    return this.emailService.syncDomainsForIntegration(id);
  }

  @Post(':id/domains')
  async addDomain(
    @Param('id') id: string,
    @Body() dto: AddSenderDomainDto,
  ) {
    return this.emailService.addSenderDomain(id, dto);
  }

  @Patch('domains/:domainId')
  async updateDomain(
    @Param('domainId') domainId: string,
    @Body() dto: UpdateSenderDomainDto,
  ) {
    return this.emailService.updateSenderDomain(domainId, dto);
  }

  @Delete('domains/:domainId')
  async deleteDomain(@Param('domainId') domainId: string) {
    return this.emailService.deleteSenderDomain(domainId);
  }
}
