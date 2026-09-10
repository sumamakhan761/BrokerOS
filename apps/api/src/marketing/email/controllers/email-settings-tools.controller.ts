// ============================================================================
// BrokerOS — Email Settings Tools (AI Config, Quick Replies, Tags) Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import {
  SaveEmailAiConfigDto,
  CreateEmailQuickReplyDto,
  UpdateEmailQuickReplyDto,
  CreateEmailTagDto,
} from '../dto/email-flows.dto.js';

@Controller('api/marketing/email')
export class EmailSettingsToolsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: EmailAiService,
  ) {}

  // ── AI Config ──

  @Get('ai/config')
  async getAiConfig() {
    return this.aiService.getAiConfig();
  }

  @Post('ai/config')
  async saveAiConfig(@Body() dto: SaveEmailAiConfigDto) {
    return this.aiService.saveAiConfig(dto);
  }

  // ── Quick Replies (Canned Shortcuts) ──

  @Get('quick-replies')
  async getQuickReplies() {
    return this.prisma.emailQuickReply.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('quick-replies')
  async createQuickReply(@Body() dto: CreateEmailQuickReplyDto) {
    const formatted = dto.shortcut.startsWith('/')
      ? dto.shortcut.trim()
      : `/${dto.shortcut.trim()}`;

    return this.prisma.emailQuickReply.create({
      data: {
        shortcut: formatted,
        title: dto.title,
        subject: dto.subject,
        contentHtml: dto.contentHtml,
        category: dto.category || 'General',
      },
    });
  }

  @Patch('quick-replies/:id')
  async updateQuickReply(
    @Param('id') id: string,
    @Body() dto: UpdateEmailQuickReplyDto,
  ) {
    const formatted = dto.shortcut
      ? dto.shortcut.startsWith('/')
        ? dto.shortcut.trim()
        : `/${dto.shortcut.trim()}`
      : undefined;

    return this.prisma.emailQuickReply.update({
      where: { id },
      data: {
        shortcut: formatted,
        title: dto.title,
        subject: dto.subject,
        contentHtml: dto.contentHtml,
        category: dto.category,
        isActive: dto.isActive,
      },
    });
  }

  @Delete('quick-replies/:id')
  async deleteQuickReply(@Param('id') id: string) {
    return this.prisma.emailQuickReply.delete({
      where: { id },
    });
  }

  // ── Email Tags ──

  @Get('tags')
  async getTags() {
    return this.prisma.emailTag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Post('tags')
  async createTag(@Body() dto: CreateEmailTagDto) {
    return this.prisma.emailTag.upsert({
      where: { name: dto.name.trim() },
      create: {
        name: dto.name.trim(),
        color: dto.color || '#8B5CF6',
      },
      update: {
        color: dto.color || undefined,
      },
    });
  }

  @Delete('tags/:id')
  async deleteTag(@Param('id') id: string) {
    return this.prisma.emailTag.delete({
      where: { id },
    });
  }
}
