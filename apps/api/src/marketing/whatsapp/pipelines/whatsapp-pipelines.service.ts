// ============================================================================
// BrokerOS — WhatsApp Pipelines & Deals Service
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';

export interface CreatePipelineDto {
  accountId?: string;
  name: string;
  isDefault?: boolean;
  stages?: Array<{ name: string; position: number; color?: string }>;
}

export interface UpdatePipelineDto {
  name?: string;
  isDefault?: boolean;
  stages?: Array<{ id?: string; name: string; position: number; color?: string }>;
}

export interface CreateDealDto {
  accountId?: string;
  pipelineId: string;
  stageId: string;
  contactId: string;
  conversationId?: string;
  title: string;
  value?: number;
  currency?: string;
  notes?: string;
  expectedCloseDate?: string;
  assignedUserId?: string;
}

export interface UpdateDealDto {
  stageId?: string;
  title?: string;
  value?: number;
  currency?: string;
  notes?: string;
  status?: string;
  expectedCloseDate?: string;
  assignedUserId?: string;
}

@Injectable()
export class WhatsAppPipelinesService {
  private readonly logger = new Logger(WhatsAppPipelinesService.name);
  private readonly prisma = prismaClient;

  private async resolveAccountId(accountId?: string): Promise<string> {
    if (accountId) return accountId;
    const defaultAcc = await this.prisma.whatsAppBusinessAccount.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!defaultAcc) {
      const anyAcc = await this.prisma.whatsAppBusinessAccount.findFirst({
        select: { id: true },
      });
      if (!anyAcc) {
        throw new BadRequestException('No WhatsApp business account configured');
      }
      return anyAcc.id;
    }
    return defaultAcc.id;
  }

  /**
   * List pipelines for account. Auto-seeds default pipeline if none exists.
   */
  async listPipelines(scopedAccountId?: string) {
    const accountId = await this.resolveAccountId(scopedAccountId);

    let pipelines = await this.prisma.whatsAppPipeline.findMany({
      where: { accountId },
      include: {
        stages: {
          orderBy: { position: 'asc' },
          include: {
            _count: { select: { deals: true } },
          },
        },
        _count: { select: { deals: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-seed default pipeline if completely fresh
    if (pipelines.length === 0) {
      const defaultPipeline = await this.prisma.whatsAppPipeline.create({
        data: {
          accountId,
          name: 'Real Estate Sales Pipeline',
          isDefault: true,
          stages: {
            create: [
              { name: 'New Inquiry', position: 0, color: '#3b82f6' },
              { name: 'Site Visit Scheduled', position: 1, color: '#f59e0b' },
              { name: 'Negotiation', position: 2, color: '#8b5cf6' },
              { name: 'Booking Won', position: 3, color: '#10b981' },
              { name: 'Lost / Disqualified', position: 4, color: '#6b7280' },
            ],
          },
        },
        include: {
          stages: {
            orderBy: { position: 'asc' },
            include: {
              _count: { select: { deals: true } },
            },
          },
          _count: { select: { deals: true } },
        },
      });
      pipelines = [defaultPipeline];
    }

    return { pipelines };
  }

  async getPipeline(id: string, scopedAccountId?: string) {
    const accountId = await this.resolveAccountId(scopedAccountId);
    const pipeline = await this.prisma.whatsAppPipeline.findFirst({
      where: { id, accountId },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }

    return pipeline;
  }

  async createPipeline(dto: CreatePipelineDto, scopedAccountId?: string) {
    const accountId = await this.resolveAccountId(dto.accountId || scopedAccountId);

    const stages = dto.stages && dto.stages.length > 0
      ? dto.stages
      : [
          { name: 'New Inquiry', position: 0, color: '#3b82f6' },
          { name: 'Site Visit Scheduled', position: 1, color: '#f59e0b' },
          { name: 'Negotiation', position: 2, color: '#8b5cf6' },
          { name: 'Closed Won', position: 3, color: '#10b981' },
        ];

    return this.prisma.whatsAppPipeline.create({
      data: {
        accountId,
        name: dto.name.trim(),
        isDefault: dto.isDefault ?? false,
        stages: {
          create: stages.map((s, idx) => ({
            name: s.name.trim(),
            position: s.position ?? idx,
            color: s.color || '#3b82f6',
          })),
        },
      },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async updatePipeline(id: string, dto: UpdatePipelineDto, scopedAccountId?: string) {
    await this.getPipeline(id, scopedAccountId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.name || dto.isDefault !== undefined) {
        await tx.whatsAppPipeline.update({
          where: { id },
          data: {
            name: dto.name?.trim(),
            isDefault: dto.isDefault,
          },
        });
      }

      if (dto.stages) {
        // Upsert stages
        for (const s of dto.stages) {
          if (s.id) {
            await tx.whatsAppPipelineStage.update({
              where: { id: s.id },
              data: {
                name: s.name.trim(),
                position: s.position,
                color: s.color,
              },
            });
          } else {
            await tx.whatsAppPipelineStage.create({
              data: {
                pipelineId: id,
                name: s.name.trim(),
                position: s.position,
                color: s.color || '#3b82f6',
              },
            });
          }
        }
      }

      return tx.whatsAppPipeline.findUnique({
        where: { id },
        include: {
          stages: { orderBy: { position: 'asc' } },
        },
      });
    });
  }

  async deletePipeline(id: string, scopedAccountId?: string) {
    const existing = await this.getPipeline(id, scopedAccountId);
    await this.prisma.whatsAppPipeline.delete({
      where: { id: existing.id },
    });
    return { success: true, message: 'Pipeline deleted' };
  }

  // ------------------------------------------------------------
  // Deals Management
  // ------------------------------------------------------------

  async listDeals(pipelineId: string, scopedAccountId?: string) {
    const accountId = await this.resolveAccountId(scopedAccountId);

    const deals = await this.prisma.whatsAppDeal.findMany({
      where: { pipelineId, accountId },
      include: {
        contact: {
          select: { id: true, name: true, phone: true, email: true, company: true },
        },
        stage: true,
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { deals };
  }

  async createDeal(dto: CreateDealDto, scopedAccountId?: string, userId?: string) {
    const accountId = await this.resolveAccountId(dto.accountId || scopedAccountId);

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.whatsAppDeal.create({
        data: {
          accountId,
          pipelineId: dto.pipelineId,
          stageId: dto.stageId,
          contactId: dto.contactId,
          conversationId: dto.conversationId,
          title: dto.title.trim(),
          value: dto.value ?? 0,
          currency: dto.currency || 'INR',
          notes: dto.notes?.trim(),
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
          assignedUserId: dto.assignedUserId,
        },
        include: {
          contact: true,
          stage: true,
          assignedUser: true,
        },
      });

      await tx.whatsAppDealActivity.create({
        data: {
          dealId: deal.id,
          authorId: userId || null,
          type: 'created',
          details: { message: `Deal created in stage "${deal.stage.name}"` },
        },
      });

      return deal;
    });
  }

  async updateDeal(id: string, dto: UpdateDealDto, scopedAccountId?: string, userId?: string) {
    const accountId = await this.resolveAccountId(scopedAccountId);
    const existing = await this.prisma.whatsAppDeal.findFirst({
      where: { id, accountId },
      include: { stage: true },
    });

    if (!existing) {
      throw new NotFoundException(`Deal ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.whatsAppDeal.update({
        where: { id },
        data: {
          stageId: dto.stageId,
          title: dto.title?.trim(),
          value: dto.value,
          currency: dto.currency,
          notes: dto.notes?.trim(),
          status: dto.status,
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
          assignedUserId: dto.assignedUserId,
        },
        include: {
          contact: true,
          stage: true,
          assignedUser: true,
        },
      });

      // Log stage transition if stage changed
      if (dto.stageId && dto.stageId !== existing.stageId) {
        await tx.whatsAppDealActivity.create({
          data: {
            dealId: id,
            authorId: userId || null,
            type: 'stage_moved',
            details: {
              fromStage: existing.stage.name,
              toStage: updated.stage.name,
            },
          },
        });
      }

      return updated;
    });
  }

  async deleteDeal(id: string, scopedAccountId?: string) {
    const accountId = await this.resolveAccountId(scopedAccountId);
    const existing = await this.prisma.whatsAppDeal.findFirst({
      where: { id, accountId },
    });
    if (!existing) {
      throw new NotFoundException(`Deal ${id} not found`);
    }

    await this.prisma.whatsAppDeal.delete({
      where: { id },
    });

    return { success: true, message: 'Deal deleted' };
  }

  async addDealActivity(
    dealId: string,
    dto: { type: string; details?: any },
    userId?: string,
  ) {
    return this.prisma.whatsAppDealActivity.create({
      data: {
        dealId,
        authorId: userId || null,
        type: dto.type || 'note',
        details: dto.details || {},
      },
    });
  }
}
