import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NegotiationsService } from './negotiations.service.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/leads/:leadId/negotiations')
@UseGuards(RolesGuard)
export class NegotiationsController {
  constructor(private readonly negotiationsService: NegotiationsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'PRE_SALES', 'PRE_SALES_MANAGER', 'CLOSING_MANAGER', 'CHANNEL_PARTNER')
  async getNegotiations(@Param('leadId') leadId: string) {
    return this.negotiationsService.getNegotiations(leadId);
  }

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'CLOSING_MANAGER', 'CHANNEL_PARTNER')
  async createNegotiation(
    @Param('leadId') leadId: string,
    @Req() req: any,
    @Body() data: {
      userId?: string;
      askingPrice?: string | number;
      offeredPrice?: string | number;
      objections?: string;
      strategy?: string;
      title?: string;
      nextStep?: string;
    }
  ) {
    const userId = data.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    return this.negotiationsService.createNegotiation(leadId, userId, {
      askingPrice: data.askingPrice ? Number(data.askingPrice) : undefined,
      offeredPrice: data.offeredPrice ? Number(data.offeredPrice) : undefined,
      customerObjections: data.objections,
      managerSuggestion: data.strategy,
      negotiationNotes: data.title,
      nextActionPlan: data.nextStep,
    });
  }
}
