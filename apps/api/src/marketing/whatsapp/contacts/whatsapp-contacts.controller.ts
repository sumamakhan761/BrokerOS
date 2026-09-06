// ============================================================================
// BrokerOS — WhatsApp Contacts, Tags & Quick Replies Controller
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
import { WhatsAppContactsService } from './whatsapp-contacts.service.js';
import {
  CreateWhatsAppContactDto,
  UpdateWhatsAppContactDto,
  ListWhatsAppContactsQueryDto,
  CreateWhatsAppTagDto,
  CreateWhatsAppQuickReplyDto,
  UpdateWhatsAppQuickReplyDto,
} from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp')
export class WhatsAppContactsController {
  constructor(private readonly contactsService: WhatsAppContactsService) { }

  // ─────────────────────────────────────────────
  // Contacts
  // ─────────────────────────────────────────────

  @Get('contacts')
  async listContacts(@Query() query: ListWhatsAppContactsQueryDto) {
    return this.contactsService.listContacts(query);
  }

  @Post('contacts')
  async createContact(@Body() dto: CreateWhatsAppContactDto) {
    return this.contactsService.createContact(dto);
  }

  @Get('contacts/:id')
  async getContact(@Param('id') id: string) {
    return this.contactsService.getContact(id);
  }

  @Patch('contacts/:id')
  async updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppContactDto,
  ) {
    return this.contactsService.updateContact(id, dto);
  }

  @Delete('contacts/:id')
  async deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }

  @Post('contacts/:id/tags/:tagId')
  async addTag(@Param('id') contactId: string, @Param('tagId') tagId: string) {
    return this.contactsService.addTag(contactId, tagId);
  }

  @Delete('contacts/:id/tags/:tagId')
  async removeTag(
    @Param('id') contactId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.contactsService.removeTag(contactId, tagId);
  }

  @Post('contacts/:id/link-lead')
  async linkLead(
    @Param('id') contactId: string,
    @Body('leadId') leadId: string | null,
  ) {
    return this.contactsService.linkToLead(contactId, leadId);
  }

  // ─────────────────────────────────────────────
  // Tags
  // ─────────────────────────────────────────────

  @Get('tags')
  async listTags(@Query('accountId') accountId?: string) {
    return this.contactsService.listTags(accountId);
  }

  @Post('tags')
  async createTag(@Body() dto: CreateWhatsAppTagDto) {
    return this.contactsService.createTag(dto);
  }

  @Delete('tags/:id')
  async deleteTag(@Param('id') id: string) {
    return this.contactsService.deleteTag(id);
  }

  // ─────────────────────────────────────────────
  // Quick Replies
  // ─────────────────────────────────────────────

  @Get('quick-replies')
  async listQuickReplies(@Query('accountId') accountId?: string) {
    return this.contactsService.listQuickReplies(accountId);
  }

  @Post('quick-replies')
  async createQuickReply(@Body() dto: CreateWhatsAppQuickReplyDto) {
    return this.contactsService.createQuickReply(dto);
  }

  @Patch('quick-replies/:id')
  async updateQuickReply(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppQuickReplyDto,
  ) {
    return this.contactsService.updateQuickReply(id, dto);
  }

  @Delete('quick-replies/:id')
  async deleteQuickReply(@Param('id') id: string) {
    return this.contactsService.deleteQuickReply(id);
  }

  // ─────────────────────────────────────────────
  // Contact Notes
  // ─────────────────────────────────────────────

  @Get('contacts/:id/notes')
  async listNotes(@Param('id') id: string) {
    return this.contactsService.listNotes(id);
  }

  @Post('contacts/:id/notes')
  async createNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    return this.contactsService.createNote(id, content, req?.user?.id);
  }

  @Delete('contacts/:id/notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string) {
    return this.contactsService.deleteNote(noteId);
  }

  // ─────────────────────────────────────────────
  // Custom Fields
  // ─────────────────────────────────────────────

  @Get('custom-fields')
  async listCustomFields(@Query('accountId') accountId?: string) {
    return this.contactsService.listCustomFields(accountId);
  }

  @Post('custom-fields')
  async createCustomField(
    @Body() dto: { name: string; type?: string; options?: any; accountId?: string },
  ) {
    return this.contactsService.createCustomField(dto);
  }

  @Post('contacts/:id/custom-values')
  async saveContactCustomValues(
    @Param('id') id: string,
    @Body('values') values: Record<string, string>,
  ) {
    return this.contactsService.saveContactCustomValues(id, values || {});
  }

  // ─────────────────────────────────────────────
  // Bulk Contact Import
  // ─────────────────────────────────────────────

  @Post('contacts/bulk-import')
  async bulkImportContacts(
    @Body('contacts') contacts: Array<{
      phone: string;
      name?: string;
      email?: string;
      company?: string;
      tags?: string[];
    }>,
    @Query('accountId') accountId?: string,
  ) {
    return this.contactsService.bulkImportContacts(contacts || [], accountId);
  }
}
