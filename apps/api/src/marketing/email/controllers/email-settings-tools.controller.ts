// ============================================================================
// BrokerOS — Email Settings Tools (AI Config, Quick Replies, Tags) Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import {
  SaveEmailAiConfigDto,
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
