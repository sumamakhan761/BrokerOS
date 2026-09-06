// ============================================================================
// BrokerOS — WhatsApp Templates Service (Meta Sync, Local CRUD, Submission)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  fetchMessageTemplates,
  submitMessageTemplate,
  deleteMessageTemplate,
  type MetaTemplateEntry,
} from '@brokeros/int-whatsapp';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import type {
  CreateWhatsAppTemplateDto,
  ListWhatsAppTemplatesQueryDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppTemplatesService {
  private readonly logger = new Logger(WhatsAppTemplatesService.name);
  private readonly prisma = prismaClient;

  constructor(private readonly configService: WhatsAppConfigService) { }

  /**
   * Sync message templates from Meta Graph API into local database.
   * Idempotent: upserts based on unique (accountId, name, language).
   */
  async syncTemplates(accountId?: string) {
    const account = await this.configService.getDecryptedAccount(accountId);
    if (!account) {
      throw new BadRequestException('WhatsApp account not found or inactive');
    }

    this.logger.log(`Syncing WhatsApp templates for WABA ${account.wabaId}...`);

    let metaTemplates: MetaTemplateEntry[] = [];
    try {
      metaTemplates = await fetchMessageTemplates({
        wabaId: account.wabaId,
        accessToken: account.accessToken,
        limit: 100,
      });
    } catch (err: any) {
      this.logger.error(`Meta template fetch failed: ${err?.message}`);
      throw new BadRequestException(`Meta API error: ${err?.message}`);
    }

    let syncedCount = 0;

    for (const mt of metaTemplates) {
      let bodyText = '';
      let headerText: string | null = null;
      let footerText: string | null = null;
      let buttons: any[] = [];
      let exampleValues: any = null;

      for (const comp of mt.components || []) {
        if (comp.type === 'BODY') {
          bodyText = comp.text || '';
          if (comp.example?.body_text) {
            exampleValues = comp.example.body_text;
          }
        } else if (comp.type === 'HEADER') {
          headerText = comp.text || null;
        } else if (comp.type === 'FOOTER') {
          footerText = comp.text || null;
        } else if (comp.type === 'BUTTONS') {
          buttons = comp.buttons || [];
        }
      }

      const status = (mt.status || 'PENDING').toUpperCase();
      const category = (mt.category || 'MARKETING').toUpperCase();

      await this.prisma.whatsAppTemplate.upsert({
        where: {
          accountId_name_language: {
            accountId: account.id,
            name: mt.name,
            language: mt.language,
          },
        },
        create: {
          accountId: account.id,
          name: mt.name,
          language: mt.language,
          category,
          status,
          headerText,
          bodyText,
          footerText,
          buttons: buttons.length > 0 ? (buttons as any) : undefined,
          exampleValues: exampleValues ? exampleValues : undefined,
          isActive: true,
        },
        update: {
          category,
          status,
          headerText,
          bodyText,
          footerText,
          buttons: buttons.length > 0 ? (buttons as any) : undefined,
          exampleValues: exampleValues ? exampleValues : undefined,
          isActive: true,
        },
      });

      syncedCount++;
    }

    this.logger.log(
      `Synced ${syncedCount} templates for account ${account.id}.`,
    );
    return { syncedCount, totalMeta: metaTemplates.length };
  }

  /**
   * List local templates with pagination and filtering.
   */
  async listTemplates(
    query: ListWhatsAppTemplatesQueryDto,
    scopedAccountId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;
    const where: Record<string, any> = { isActive: true };

    if (accountId) where.accountId = accountId;
    if (query.status) where.status = query.status.toUpperCase();
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.whatsAppTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppTemplate.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single template by ID.
   */
  async getTemplate(id: string, scopedAccountId?: string) {
    const where: Record<string, any> = { id };
    if (scopedAccountId) where.accountId = scopedAccountId;

    const template = await this.prisma.whatsAppTemplate.findFirst({
      where,
    });

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return template;
  }

  /**
   * Create and submit a new message template to Meta Cloud API.
   */
  async createTemplate(
    dto: CreateWhatsAppTemplateDto,
    scopedAccountId?: string,
  ) {
    let accountId = scopedAccountId || dto.accountId;
    if (!accountId) {
      const defaultAccount = await this.prisma.whatsAppBusinessAccount.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (defaultAccount) accountId = defaultAccount.id;
    }
    if (!accountId) {
      throw new BadRequestException('WhatsApp account not found or inactive');
    }

    const account = await this.configService.getDecryptedAccount(accountId);
    if (!account) {
      throw new BadRequestException('WhatsApp account not found or inactive');
    }

    // Build components array for Meta submission
    const components: any[] = [];

    if (dto.headerText) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: dto.headerText,
      });
    }

    components.push({
      type: 'BODY',
      text: dto.bodyText,
      example: dto.exampleValues
        ? { body_text: [dto.exampleValues] }
        : undefined,
    });

    if (dto.footerText) {
      components.push({
        type: 'FOOTER',
        text: dto.footerText,
      });
    }

    if (dto.buttons && dto.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: dto.buttons,
      });
    }

    const payload = {
      name: dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_'),
      language: dto.language || 'en_US',
      category: dto.category.toUpperCase(),
      components,
    };

    let metaResult: { id: string; status: string };
    try {
      metaResult = await submitMessageTemplate({
        wabaId: account.wabaId,
        accessToken: account.accessToken,
        payload,
      });
    } catch (err: any) {
      this.logger.error(`Template submission failed: ${err?.message}`);
      throw new BadRequestException(
        `Meta template submission failed: ${err?.message}`,
      );
    }

    // Save locally
    return this.prisma.whatsAppTemplate.upsert({
      where: {
        accountId_name_language: {
          accountId: account.id,
          name: payload.name,
          language: payload.language,
        },
      },
      create: {
        accountId: account.id,
        name: payload.name,
        language: payload.language,
        category: payload.category,
        status: metaResult.status || 'PENDING',
        headerText: dto.headerText || null,
        bodyText: dto.bodyText,
        footerText: dto.footerText || null,
        buttons: dto.buttons ? (dto.buttons as any) : undefined,
        exampleValues: dto.exampleValues ? dto.exampleValues : undefined,
        isActive: true,
      },
      update: {
        category: payload.category,
        status: metaResult.status || 'PENDING',
        headerText: dto.headerText || null,
        bodyText: dto.bodyText,
        footerText: dto.footerText || null,
        buttons: dto.buttons ? (dto.buttons as any) : undefined,
        exampleValues: dto.exampleValues ? dto.exampleValues : undefined,
        isActive: true,
      },
    });
  }

  /**
   * Delete a template from Meta and mark inactive locally.
   */
  async deleteTemplate(id: string, scopedAccountId?: string) {
    const template = await this.getTemplate(id, scopedAccountId);
    const account = await this.configService.getDecryptedAccount(
      template.accountId,
    );

    if (account) {
      try {
        await deleteMessageTemplate({
          wabaId: account.wabaId,
          accessToken: account.accessToken,
          name: template.name,
        });
      } catch (err: any) {
        this.logger.warn(
          `Failed to delete template from Meta: ${err?.message}`,
        );
      }
    }

    await this.prisma.whatsAppTemplate.update({
      where: { id: template.id },
      data: { isActive: false },
    });

    return { success: true, message: 'Template deleted' };
  }
}
