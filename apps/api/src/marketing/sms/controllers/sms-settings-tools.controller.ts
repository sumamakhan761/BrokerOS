// ============================================================================
// BrokerOS — SMS Settings Tools (AI Config, Quick Replies, Tags) Controller
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
import { SmsAiService } from '../ai/sms-ai.service.js';
import { DEFAULT_SMS_QUICK_REPLIES } from '@brokeros/constants';
import {
  SaveSmsAiConfigDto,
  CreateSmsTagDto,
} from '../dto/sms-flows.dto.js';

@Controller('api/marketing/sms')
export class SmsSettingsToolsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: SmsAiService,
  ) {}

  // ── AI Config ──

  @Get('ai/config')
  async getAiConfig() {
    return this.aiService.getAiConfig();
  }

  @Post('ai/config')
  async saveAiConfig(@Body() dto: SaveSmsAiConfigDto) {
    return this.aiService.saveAiConfig(dto);
  }

  @Post('ai/test')
  async testAi(@Body() body: { text: string; instructions?: string; leadName?: string }) {
    return this.aiService.generateAutoreply({
      inboundBody: body.text || 'Is a 3BHK available?',
      customInstructions: body.instructions,
      leadName: body.leadName,
    });
  }

  // ── Quick Replies ──

  @Get('quick-replies')
  async getQuickReplies() {
    return { items: DEFAULT_SMS_QUICK_REPLIES };
  }

  // ── SMS Tags ──

  @Get('tags')
  async getTags() {
    return this.prisma.smsTag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Post('tags')
  async createTag(@Body() dto: CreateSmsTagDto) {
    return this.prisma.smsTag.upsert({
      where: { name: dto.name.trim() },
      create: {
        name: dto.name.trim(),
        color: dto.color || '#3B82F6',
      },
      update: {
        color: dto.color || undefined,
      },
    });
  }

  @Delete('tags/:id')
  async deleteTag(@Param('id') id: string) {
    return this.prisma.smsTag.delete({
      where: { id },
    });
  }
}
