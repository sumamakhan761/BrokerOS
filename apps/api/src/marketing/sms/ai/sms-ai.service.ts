// ============================================================================
// BrokerOS — SMS AI Assistant & Autoreply Service (Groq openai/gpt-oss-120b)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { encrypt, decrypt } from '@brokeros/int-whatsapp';
import type { SaveSmsAiConfigDto } from '../dto/sms-flows.dto.js';

export interface SmsAiGenerateReplyArgs {
  leadName?: string;
  inboundBody: string;
  originalCampaignTitle?: string;
  project?: {
    name?: string;
    city?: string;
    address?: string;
    description?: string;
    amenities?: string[];
    brochureUrl?: string;
  } | null;
  customInstructions?: string;
}

@Injectable()
export class SmsAiService {
  private readonly logger = new Logger(SmsAiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active SMS AI configuration. Masked API key.
   */
  async getAiConfig() {
    const config = await this.prisma.smsAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return {
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
        apiKey: null,
        systemPrompt: this.getDefaultSystemPrompt(),
        isActive: true,
        autoReplyEnabled: false,
        autoReplyMaxPerLead: 3,
        maxCharacters: 160,
      };
    }

    return {
      ...config,
      apiKey: config.apiKey ? '••••••••' : null,
    };
  }

  /**
   * Save or update SMS AI configuration.
   */
  async saveAiConfig(dto: SaveSmsAiConfigDto) {
    const existing = await this.prisma.smsAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let encryptedKey = existing?.apiKey || '';
    if (dto.apiKey === '' || dto.apiKey === null) {
      encryptedKey = '';
    } else if (dto.apiKey && dto.apiKey !== '••••••••') {
      encryptedKey = encrypt(dto.apiKey.trim());
    }

    const selectedModel =
      dto.model && dto.model.trim().length > 0
        ? dto.model.trim()
        : dto.provider === 'openai'
          ? 'gpt-4o-mini'
          : 'openai/gpt-oss-120b';

    const systemPrompt =
      dto.systemPrompt && dto.systemPrompt.trim().length > 0
        ? dto.systemPrompt
        : this.getDefaultSystemPrompt();

    if (existing) {
      return this.prisma.smsAiConfig.update({
        where: { id: existing.id },
        data: {
          provider: dto.provider || existing.provider || 'groq',
          model: selectedModel,
          apiKey: encryptedKey,
          systemPrompt,
          isActive: dto.isActive ?? existing.isActive,
          autoReplyEnabled: dto.autoReplyEnabled ?? existing.autoReplyEnabled,
          autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? existing.autoReplyMaxPerLead,
          maxCharacters: dto.maxCharacters ?? existing.maxCharacters,
        },
      });
    }

    return this.prisma.smsAiConfig.create({
      data: {
        provider: dto.provider || 'groq',
        model: selectedModel,
        apiKey: encryptedKey,
        systemPrompt,
        isActive: dto.isActive ?? true,
        autoReplyEnabled: dto.autoReplyEnabled ?? false,
        autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? 3,
        maxCharacters: dto.maxCharacters ?? 160,
      },
    });
  }

  /**
   * Generate an automated SMS reply using Groq LPU inference.
   * Strictly enforces character brevity <= 160 chars.
   */
  async generateAutoreply(args: SmsAiGenerateReplyArgs): Promise<{
    text: string;
    modelUsed: string;
  }> {
    const config = await this.prisma.smsAiConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    let apiKey = '';
    if (config?.apiKey) {
      try {
        apiKey = decrypt(config.apiKey);
      } catch {
        apiKey = '';
      }
    }

    if (!apiKey) {
      apiKey = process.env.GROQ_API_KEY || '';
    }

    const provider = config?.provider || 'groq';
    const model = config?.model || 'openai/gpt-oss-120b';
    const maxChars = config?.maxCharacters || 160;

    const leadName = args.leadName || 'Valued Client';
    const campaignTitle = args.originalCampaignTitle || 'Luxury Real Estate';
    const projectInfo = args.project
      ? `Project: ${args.project.name || 'Skyline Luxuria'}, ${args.project.city || 'Mumbai'}. ${args.project.description || ''}`
      : 'Brokerage Luxury Residences';

    const systemPrompt =
      config?.systemPrompt ||
      this.getDefaultSystemPrompt();

    const userPrompt = `
Inbound SMS from lead "${leadName}":
"${args.inboundBody}"

Campaign Context: "${campaignTitle}"
${projectInfo}
${args.customInstructions ? `Special Instructions: ${args.customInstructions}` : ''}

Generate a friendly, professional, and ultra-concise SMS reply (STRICTLY UNDER ${maxChars} CHARACTERS). Include a clear call-to-action.
`.trim();

    if (apiKey) {
      try {
        const endpoint =
          provider === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 80,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          let replyText = data.choices?.[0]?.message?.content?.trim() || '';
          if (replyText.startsWith('"') && replyText.endsWith('"')) {
            replyText = replyText.slice(1, -1);
          }
          if (replyText.length > maxChars) {
            replyText = replyText.slice(0, maxChars - 3) + '...';
          }
          return {
            text: replyText,
            modelUsed: model,
          };
        }
      } catch (err: any) {
        this.logger.error(`AI API call failed: ${err.message}`);
      }
    }

    // Fallback template
    const fallback = `Hi ${leadName}, thanks for your reply! Our Senior Relationship Manager will call you shortly with details. Visit: brokeros.io`;
    return {
      text: fallback.slice(0, maxChars),
      modelUsed: 'rule-based-fallback',
    };
  }

  private getDefaultSystemPrompt(): string {
    return `You are the AI Concierge for BrokerOS, an enterprise real estate brokerage platform.
Your task is to craft high-conversion, polite, and ultra-concise SMS responses to prospective home buyers.
Rules:
1. Always keep responses under 160 characters (GSM-7 single segment standard).
2. Answer inquiries directly (pricing, visit scheduling, brochure requests).
3. Always include a short CTA (e.g. "Can we call you at 4 PM?" or "Would Saturday 11 AM work for a tour?").
4. Never mention you are an AI. Speak as the senior property consultant.`;
  }
}
