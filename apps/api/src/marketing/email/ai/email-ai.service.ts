// ============================================================================
// BrokerOS — Email AI Assistant & Autoreply Service (Groq openai/gpt-oss-120b)
// ============================================================================

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { encrypt, decrypt } from '@brokeros/int-whatsapp';
import type { SaveEmailAiConfigDto } from '../dto/email-flows.dto.js';

export interface EmailAiGenerateReplyArgs {
  leadName?: string;
  inboundSubject?: string;
  inboundBody: string;
  originalCampaignTitle?: string;
  originalSubject?: string;
  project?: {
    name?: string;
    city?: string;
    address?: string;
    description?: string;
    amenities?: string[];
    brochureUrl?: string;
  } | null;
}

@Injectable()
export class EmailAiService {
  private readonly logger = new Logger(EmailAiService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get active Email AI configuration. Masked API key.
   */
  async getAiConfig() {
    const config = await this.prisma.emailAiConfig.findFirst({
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
      };
    }

    return {
      ...config,
      apiKey: config.apiKey ? '••••••••' : null,
    };
  }

  /**
   * Save or update Email AI configuration.
   */
  async saveAiConfig(dto: SaveEmailAiConfigDto) {
    const existing = await this.prisma.emailAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let encryptedKey = existing?.apiKey || '';
    if (dto.apiKey === '' || dto.apiKey === null) {
      encryptedKey = '';
    } else if (dto.apiKey && dto.apiKey !== '••••••••') {
      encryptedKey = encrypt(dto.apiKey.trim());
    }

    // Default to openai/gpt-oss-120b as requested
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
      return this.prisma.emailAiConfig.update({
        where: { id: existing.id },
        data: {
          provider: dto.provider || existing.provider || 'groq',
          model: selectedModel,
          apiKey: encryptedKey,
          systemPrompt,
          isActive: dto.isActive ?? existing.isActive,
          autoReplyEnabled: dto.autoReplyEnabled ?? existing.autoReplyEnabled,
          autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? existing.autoReplyMaxPerLead,
        },
      });
    }

    return this.prisma.emailAiConfig.create({
      data: {
        provider: dto.provider || 'groq',
        model: selectedModel,
        apiKey: encryptedKey,
        systemPrompt,
        isActive: dto.isActive ?? true,
        autoReplyEnabled: dto.autoReplyEnabled ?? false,
        autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? 3,
      },
    });
  }

  /**
   * Generates an intelligent real estate reply using Groq (openai/gpt-oss-120b)
   */
  async generateAutoreply(args: EmailAiGenerateReplyArgs): Promise<{
    subject: string;
    textBody: string;
    htmlBody: string;
  }> {
    const config = await this.prisma.emailAiConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    let provider = config?.provider || 'groq';
    let model = config?.model || 'openai/gpt-oss-120b';
    let rawApiKey = '';

    if (config?.apiKey) {
      try {
        rawApiKey = decrypt(config.apiKey);
      } catch {
        this.logger.warn('Failed to decrypt custom Email AI key, falling back to .env');
      }
    }

    // Fallback to environment variables
    if (!rawApiKey) {
      if (process.env.GROQ_API_KEY) {
        provider = 'groq';
        rawApiKey = process.env.GROQ_API_KEY;
        model = 'openai/gpt-oss-120b';
      } else if (process.env.OPENAI_API_KEY) {
        provider = 'openai';
        rawApiKey = process.env.OPENAI_API_KEY;
        model = 'gpt-4o-mini';
      }
    }

    if (!rawApiKey) {
      throw new BadRequestException(
        'No AI API key found. Please configure Groq or OpenAI key in Email Settings.',
      );
    }

    // Build context prompt
    const clientName = args.leadName || 'Valued Prospect';
    const projectName = args.project?.name || args.originalCampaignTitle || 'Our Premier Residential Project';
    const projectCity = args.project?.city || 'the prime city center';
    const amenities = args.project?.amenities?.join(', ') || 'Clubhouse, Swimming Pool, High-speed Elevators, 24/7 Security';

    const systemPrompt =
      config?.systemPrompt ||
      this.getDefaultSystemPrompt();

    const injectedSystemPrompt = `${systemPrompt}

REAL ESTATE PROJECT KNOWLEDGE CONTEXT:
- Project Name: ${projectName}
- City / Location: ${projectCity}
- Key Highlights & Amenities: ${amenities}
- Recipient Name: ${clientName}
${args.project?.brochureUrl ? `- Digital Brochure Link: ${args.project.brochureUrl}` : ''}

INSTRUCTIONS FOR EMAIL FORMATTING:
- Keep the reply courteous, concise, and professional (under 150 words).
- Address their specific question directly.
- Include a strong, polite call-to-action inviting them to book a physical site visit or request a call.
- Do NOT output markdown code blocks. Output clean plain text paragraphs suitable for email.`;

    const userPrompt = `A prospective buyer has replied to our broadcast regarding "${args.originalCampaignTitle || projectName}".
Original Subject: ${args.originalSubject || 'Exclusive Property Update'}
Buyer Inbound Message:
"${args.inboundBody}"

Please write a warm, crisp, professional email reply.`;

    // Dispatch to LLM API
    const endpoint =
      provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: injectedSystemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 600,
          temperature: 0.65,
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`AI API returned error ${response.status}: ${errText}`);
        throw new Error(`AI completion failed: HTTP ${response.status}`);
      }

      const resData = await response.json();
      const rawText: string =
        resData?.choices?.[0]?.message?.content?.trim() ||
        `Hello ${clientName},\n\nThank you for reaching out regarding ${projectName}. We would be delighted to assist you with floor plans and a personalized site visit.\n\nBest regards,\nSales & Advisory Team`;

      // Format subject with Re:
      const replySubject = args.inboundSubject?.startsWith('Re:')
        ? args.inboundSubject
        : `Re: ${args.inboundSubject || args.originalSubject || projectName}`;

      // Convert paragraphs to simple responsive HTML
      const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  ${rawText
          .split('\n\n')
          .map((p) => `<p style="margin-bottom: 12px;">${p.replace(/\n/g, '<br/>')}</p>`)
          .join('')}
</div>`;

      return {
        subject: replySubject,
        textBody: rawText,
        htmlBody,
      };
    } catch (err: any) {
      this.logger.error(`AI generation failure: ${err?.message}`);
      throw new BadRequestException(`Failed to generate AI auto-reply: ${err?.message}`);
    }
  }

  /**
   * Alias for generateAutoreply
   */
  async generateAiReply(args: EmailAiGenerateReplyArgs) {
    return this.generateAutoreply(args);
  }

  private getDefaultSystemPrompt(): string {
    return `You are an elite real estate sales advisor and concierge for an enterprise brokerage.
Your role is to assist prospective buyers courteously, provide crisp property insights, answer pricing, configuration, and site visit scheduling queries, and encourage booking an on-site visit.`;
  }
}
