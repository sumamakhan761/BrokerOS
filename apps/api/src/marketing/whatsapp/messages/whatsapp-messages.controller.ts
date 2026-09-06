// ============================================================================
// BrokerOS — WhatsApp Messages Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { WhatsAppMessagesService } from './whatsapp-messages.service.js';
import {
  SendWhatsAppMessageDto,
  SendMessageDirectDto,
  SendWhatsAppTemplateDirectDto,
  ListWhatsAppMessagesQueryDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/messages')
export class WhatsAppMessagesController {
  constructor(private readonly messagesService: WhatsAppMessagesService) {}

  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: ListWhatsAppMessagesQueryDto,
  ) {
    return this.messagesService.getMessages(conversationId, query);
  }

  @Post('send')
  async sendMessageDirect(
    @Body() dto: SendMessageDirectDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name }
      : undefined;
    return this.messagesService.sendMessage(dto.conversationId, dto, sender);
  }

  @Post('send-template')
  async sendTemplateDirect(
    @Body() dto: SendWhatsAppTemplateDirectDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name }
      : undefined;
    return this.messagesService.sendTemplateDirect(dto, sender);
  }

  @Post(':conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendWhatsAppMessageDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name }
      : undefined;
    return this.messagesService.sendMessage(conversationId, dto, sender);
  }
}

