// ============================================================================
// BrokerOS — WhatsApp Automations Service (CRUD & Configuration with Tree Support)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { prismaClient } from '@brokeros/prisma';
import type {
  CreateWhatsAppAutomationDto,
  UpdateWhatsAppAutomationDto,
  ListWhatsAppAutomationsQueryDto,
} from '../dto/whatsapp.dto.js';

export interface AutomationStepInput {
  id?: string;
  stepType: string;
  stepConfig: Record<string, any>;
  position?: number;
  branch?: 'yes' | 'no' | null;
  parentStepId?: string | null;
  branches?: { yes?: AutomationStepInput[]; no?: AutomationStepInput[] };
}

function flattenStepsTree(
  steps: any[],
  automationId: string,
): Array<{
  id: string;
  automationId: string;
  parentStepId: string | null;
  branch: string | null;
  stepType: string;
  stepConfig: any;
  position: number;
}> {
  const rows: any[] = [];
  function walk(
    items: any[],
    parentId: string | null,
    branch: 'yes' | 'no' | null,
  ) {
    items.forEach((s, idx) => {
      const id = s.id || crypto.randomUUID();
      rows.push({
        id,
        automationId,
        parentStepId: s.parentStepId !== undefined ? s.parentStepId : parentId,
        branch: s.branch !== undefined ? s.branch : branch,
        stepType: s.stepType || s.step_type,
        stepConfig: s.stepConfig || s.step_config || {},
        position: s.position !== undefined ? s.position : idx,
      });

      if (
        (s.stepType === 'condition' || s.step_type === 'condition') &&
        s.branches
      ) {
        if (s.branches.yes) walk(s.branches.yes, id, 'yes');
        if (s.branches.no) walk(s.branches.no, id, 'no');
      }
    });
  }
  walk(steps, null, null);
  return rows;
}

function assembleStepsTree(rows: any[]): any[] {
  const byId = new Map<string, any>();
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      stepType: r.stepType,
      stepConfig: r.stepConfig,
      position: r.position,
      parentStepId: r.parentStepId,
      branch: r.branch,
      branches: { yes: [], no: [] },
    });
  }

  const roots: any[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parentStepId && byId.has(r.parentStepId)) {
      const parent = byId.get(r.parentStepId)!;
      const b = (r.branch || 'yes') as 'yes' | 'no';
      if (!parent.branches[b]) parent.branches[b] = [];
      parent.branches[b].push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

@Injectable()
export class WhatsAppAutomationsService {
  private readonly logger = new Logger(WhatsAppAutomationsService.name);
  private readonly prisma = prismaClient;

  /**
   * List automations with steps and basic run counters.
   */
  async listAutomations(
    query: ListWhatsAppAutomationsQueryDto,
    scopedAccountId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const accountId = scopedAccountId || query.accountId;
    const where: Record<string, any> = {};

    if (accountId) where.accountId = accountId;
    if (query.triggerType) where.triggerType = query.triggerType;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [items, total] = await Promise.all([
      this.prisma.whatsAppAutomation.findMany({
        where,
        include: {
          steps: {
            orderBy: { position: 'asc' },
          },
          _count: {
            select: { logs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppAutomation.count({ where }),
    ]);

    return {
      items: items.map((a) => ({
        ...a,
        stepsTree: assembleStepsTree(a.steps),
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
   * Get single automation with both flat steps and nested builder tree.
   */
  async getAutomation(id: string, scopedAccountId?: string) {
    const where: Record<string, any> = { id };
    if (scopedAccountId) where.accountId = scopedAccountId;

    const automation = await this.prisma.whatsAppAutomation.findFirst({
      where,
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!automation) {
      throw new NotFoundException(`Automation ${id} not found`);
    }

    return {
      ...automation,
      stepsTree: assembleStepsTree(automation.steps),
    };
  }

  /**
   * Create a new automation with ordered steps atomically (supports nested trees).
   */
  async createAutomation(dto: CreateWhatsAppAutomationDto, userId?: string) {
    let accountId = dto.accountId;
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

    if (!dto.steps || dto.steps.length === 0) {
      throw new BadRequestException('At least one automation step is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const automation = await tx.whatsAppAutomation.create({
        data: {
          accountId,
          createdById: userId || null,
          name: dto.name.trim(),
          triggerType: dto.triggerType,
          triggerConfig: dto.triggerConfig || undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      const stepInserts = flattenStepsTree(dto.steps, automation.id);
      await tx.whatsAppAutomationStep.createMany({
        data: stepInserts,
      });

      const full = await tx.whatsAppAutomation.findUnique({
        where: { id: automation.id },
        include: {
          steps: { orderBy: { position: 'asc' } },
        },
      });

      return {
        ...full,
        stepsTree: assembleStepsTree(full?.steps || []),
      };
    });
  }

  /**
   * Update automation metadata and replace steps atomically.
   */
  async updateAutomation(
    id: string,
    dto: UpdateWhatsAppAutomationDto,
    scopedAccountId?: string,
  ) {
    const existing = await this.getAutomation(id, scopedAccountId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.steps && dto.steps.length > 0) {
        await tx.whatsAppAutomationStep.deleteMany({
          where: { automationId: existing.id },
        });

        const stepInserts = flattenStepsTree(dto.steps, existing.id);
        await tx.whatsAppAutomationStep.createMany({
          data: stepInserts,
        });
      }

      const updated = await tx.whatsAppAutomation.update({
        where: { id: existing.id },
        data: {
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          triggerType:
            dto.triggerType !== undefined ? dto.triggerType : undefined,
          triggerConfig:
            dto.triggerConfig !== undefined ? dto.triggerConfig : undefined,
          isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        },
        include: {
          steps: { orderBy: { position: 'asc' } },
        },
      });

      return {
        ...updated,
        stepsTree: assembleStepsTree(updated.steps),
      };
    });
  }

  /**
   * Toggle automation active state.
   */
  async toggleAutomation(
    id: string,
    isActive: boolean,
    scopedAccountId?: string,
  ) {
    const existing = await this.getAutomation(id, scopedAccountId);

    return this.prisma.whatsAppAutomation.update({
      where: { id: existing.id },
      data: { isActive },
    });
  }

  /**
   * Delete an automation and cascade delete its steps and logs.
   */
  async deleteAutomation(id: string, scopedAccountId?: string) {
    const existing = await this.getAutomation(id, scopedAccountId);

    await this.prisma.whatsAppAutomation.delete({
      where: { id: existing.id },
    });

    return { success: true, message: 'Automation deleted' };
  }

  /**
   * View audit execution logs for an automation.
   */
  async getLogs(
    automationId: string,
    query: { page?: number | string; limit?: number | string },
    scopedAccountId?: string,
  ) {
    await this.getAutomation(automationId, scopedAccountId);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.whatsAppAutomationLog.findMany({
        where: { automationId },
        include: {
          contact: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppAutomationLog.count({
        where: { automationId },
      }),
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
