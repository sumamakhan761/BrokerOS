// ============================================================================
// BrokerOS — WhatsApp Conversations Controller
// ============================================================================

import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { WhatsAppConversationsService } from './whatsapp-conversations.service.js';
import { WhatsAppMessagesService } from '../messages/whatsapp-messages.service.js';
import {
  ListWhatsAppConversationsQueryDto,
  StartWhatsAppConversationDto,
  UpdateWhatsAppConversationStatusDto,
  AssignWhatsAppConversationAgentDto,
  ListWhatsAppMessagesQueryDto,
  SendWhatsAppMessageDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/conversations')
export class WhatsAppConversationsController {
  constructor(
    private readonly conversationsService: WhatsAppConversationsService,
    private readonly messagesService: WhatsAppMessagesService,
  ) { }

  @Get()
  async listConversations(@Query() query: ListWhatsAppConversationsQueryDto) {
    return this.conversationsService.listConversations(query);
  }

  @Post()
  async startConversation(@Body() dto: StartWhatsAppConversationDto) {
    return this.conversationsService.startOrCreateConversation(dto);
  }

  @Post('start')
  async startConversationAlias(@Body() dto: StartWhatsAppConversationDto) {
    return this.conversationsService.startOrCreateConversation(dto);
  }

  @Get(':id')
  async getConversation(@Param('id') id: string) {
    return this.conversationsService.getConversation(id);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query() query: ListWhatsAppMessagesQueryDto,
  ) {
    return this.messagesService.getMessages(conversationId, query);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendWhatsAppMessageDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name }
      : undefined;
    return this.messagesService.sendMessage(conversationId, dto, sender);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppConversationStatusDto,
  ) {
    return this.conversationsService.updateStatus(id, dto.status);
  }

  @Patch(':id/agent')
  @Patch(':id/assign')
  async assignAgent(
    @Param('id') id: string,
    @Body() dto: AssignWhatsAppConversationAgentDto,
    @Req() req: any,
  ) {
    // If agentUserId not provided, default to current user if requested
    const agentId =
      dto.agentUserId !== undefined ? dto.agentUserId : req?.user?.id;
    return this.conversationsService.assignAgent(id, agentId);
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    return this.conversationsService.markRead(id);
  }
}
