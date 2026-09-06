// ============================================================================
// BrokerOS — WhatsApp Flows Service (CRUD & Flow Management)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type {
  CreateWhatsAppFlowDto,
  UpdateWhatsAppFlowDto,
  ListWhatsAppFlowsQueryDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppFlowsService {
  private readonly logger = new Logger(WhatsAppFlowsService.name);
  private readonly prisma = prismaClient;

  /**
   * List all flows for an account with filters and node counts.
   */
  async listFlows(query: ListWhatsAppFlowsQueryDto, scopedAccountId?: string) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;
    const where: Record<string, any> = {};

    if (accountId) where.accountId = accountId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.whatsAppFlow.findMany({
        where,
        include: {
          nodes: true,
          _count: {
            select: { runs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppFlow.count({ where }),
    ]);

    return {
      items: items.map((f) => ({
        ...f,
        nodesCount: f.nodes.length,
        runsCount: f._count.runs,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single flow with all its graph nodes.
   */
  async getFlow(id: string, scopedAccountId?: string) {
    const where: Record<string, any> = { id };
    if (scopedAccountId) where.accountId = scopedAccountId;

    const flow = await this.prisma.whatsAppFlow.findFirst({
      where,
      include: {
        nodes: true,
        _count: {
          select: { runs: true },
        },
      },
    });

    if (!flow) {
      throw new NotFoundException(`WhatsApp Flow ${id} not found`);
    }

    return flow;
  }

  /**
   * Create a new flow with its initial node graph atomically.
   */
  async createFlow(dto: CreateWhatsAppFlowDto, scopedAccountId?: string) {
    let accountId = scopedAccountId || dto.accountId;
    if (!accountId) {
      const defaultAccount =
        await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
      if (!defaultAccount) {
        throw new BadRequestException(
          'No active WhatsApp business account found',
        );
      }
      accountId = defaultAccount.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const flow = await tx.whatsAppFlow.create({
        data: {
          accountId,
          name: dto.name.trim(),
          status: dto.status || 'draft',
          triggerType: dto.triggerType,
          triggerConfig: dto.triggerConfig || undefined,
        },
      });

      if (dto.nodes && dto.nodes.length > 0) {
        await tx.whatsAppFlowNode.createMany({
          data: dto.nodes.map((node, idx) => ({
            flowId: flow.id,
            nodeKey: node.nodeKey || `node_${idx}_${Date.now().toString(36).slice(-4)}`,
            nodeType: node.nodeType || 'send_message',
            config: (node.config as any) ?? {},
          })),
        });
      }

      return tx.whatsAppFlow.findUnique({
        where: { id: flow.id },
        include: { nodes: true },
      });
    });
  }

  /**
   * Update flow metadata and replace its graph nodes atomically.
   */
  async updateFlow(
    id: string,
    dto: UpdateWhatsAppFlowDto,
    scopedAccountId?: string,
  ) {
    const existing = await this.getFlow(id, scopedAccountId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.nodes !== undefined) {
        await tx.whatsAppFlowNode.deleteMany({
          where: { flowId: existing.id },
        });

        if (dto.nodes.length > 0) {
          await tx.whatsAppFlowNode.createMany({
            data: dto.nodes.map((node, idx) => ({
              flowId: existing.id,
              nodeKey: node.nodeKey || `node_${idx}_${Date.now().toString(36).slice(-4)}`,
              nodeType: node.nodeType || 'send_message',
              config: (node.config as any) ?? {},
            })),
          });
        }
      }

      return tx.whatsAppFlow.update({
        where: { id: existing.id },
        data: {
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          status: dto.status !== undefined ? dto.status : undefined,
          triggerType:
            dto.triggerType !== undefined ? dto.triggerType : undefined,
          triggerConfig:
            dto.triggerConfig !== undefined ? dto.triggerConfig : undefined,
        },
        include: { nodes: true },
      });
    });
  }

  /**
   * Toggle flow status (draft, active, archived).
   */
  async toggleFlow(id: string, status: string, scopedAccountId?: string) {
    const existing = await this.getFlow(id, scopedAccountId);

    return this.prisma.whatsAppFlow.update({
      where: { id: existing.id },
      data: { status },
    });
  }

  /**
   * Delete flow and cascade delete nodes and runs.
   */
  async deleteFlow(id: string, scopedAccountId?: string) {
    const existing = await this.getFlow(id, scopedAccountId);

    await this.prisma.whatsAppFlow.delete({
      where: { id: existing.id },
    });

    return { success: true, message: 'Flow deleted' };
  }

  /**
   * Get execution runs for a flow.
   */
  async getFlowRuns(
    flowId: string,
    query: { page?: number | string; limit?: number | string; status?: string },
    scopedAccountId?: string,
  ) {
    await this.getFlow(flowId, scopedAccountId);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { flowId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.whatsAppFlowRun.findMany({
        where,
        include: {
          contact: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppFlowRun.count({ where }),
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
}
