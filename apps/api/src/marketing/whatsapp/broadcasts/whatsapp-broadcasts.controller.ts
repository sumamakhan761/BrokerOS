// ============================================================================
// BrokerOS — WhatsApp Broadcasts Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { WhatsAppBroadcastsService } from './whatsapp-broadcasts.service.js';
import {
  CreateWhatsAppBroadcastDto,
  ListWhatsAppBroadcastsQueryDto,
  ScheduleWhatsAppBroadcastDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/broadcasts')
export class WhatsAppBroadcastsController {
  constructor(private readonly broadcastsService: WhatsAppBroadcastsService) {}

  @Get()
  async listBroadcasts(@Query() query: ListWhatsAppBroadcastsQueryDto) {
    return this.broadcastsService.listBroadcasts(query);
  }

  @Post()
  async createBroadcast(
    @Body() dto: CreateWhatsAppBroadcastDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id;
    return this.broadcastsService.createBroadcast(dto, userId);
  }

  @Get(':id')
  async getBroadcast(@Param('id') id: string) {
    return this.broadcastsService.getBroadcast(id);
  }

  @Delete(':id')
  async deleteBroadcast(@Param('id') id: string) {
    return this.broadcastsService.deleteBroadcast(id);
  }

  @Get(':id/recipients')
  async getRecipients(
    @Param('id') id: string,
    @Query() query: { status?: string; page?: string; limit?: string },
  ) {
    return this.broadcastsService.getRecipients(id, query);
  }

  @Post(':id/schedule')
  async scheduleBroadcast(
    @Param('id') id: string,
    @Body() dto: ScheduleWhatsAppBroadcastDto,
  ) {
    return this.broadcastsService.scheduleBroadcast(id, dto);
  }

  @Post(':id/dispatch')
  async dispatchNow(@Param('id') id: string) {
    return this.broadcastsService.dispatchNow(id);
  }

  @Post(':id/cancel')
  async cancelBroadcast(@Param('id') id: string) {
    return this.broadcastsService.cancelBroadcast(id);
  }
}
