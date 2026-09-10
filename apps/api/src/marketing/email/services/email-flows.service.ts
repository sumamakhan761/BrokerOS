// ============================================================================
// BrokerOS — Email Flows Management Service
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { CreateEmailFlowDto, UpdateEmailFlowDto } from '../dto/email-flows.dto.js';

@Injectable()
export class EmailFlowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const flows = await this.prisma.emailFlow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            nodes: true,
            runs: true,
          },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      items: flows.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        status: f.status,
        triggerType: f.triggerType,
        triggerConfig: f.triggerConfig,
        isGlobal: f.isGlobal,
        campaignIds: f.campaignIds,
        projectId: f.projectId,
        projectName: f.project?.name || null,
        nodesCount: f._count.nodes,
        runsCount: f._count.runs,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    };
  }

  async findById(id: string) {
    const flow = await this.prisma.emailFlow.findUnique({
      where: { id },
      include: {
        nodes: {
          orderBy: { createdAt: 'asc' },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!flow) {
      throw new NotFoundException(`Email Flow ${id} not found`);
    }

    return flow;
  }

  async create(dto: CreateEmailFlowDto) {
    const flowId = await this.prisma.$transaction(async (tx) => {
      const flow = await tx.emailFlow.create({
        data: {
          name: dto.name,
          description: dto.description,
          triggerType: dto.triggerType || 'keyword_match',
          triggerConfig: (dto.triggerConfig as any) || { keywords: ['visit', 'price'], matchMode: 'contains' },
          isGlobal: dto.isGlobal ?? true,
          campaignIds: dto.campaignIds || [],
          projectId: dto.projectId,
          status: 'draft',
        },
      });

      if (dto.nodes && dto.nodes.length > 0) {
        await tx.emailFlowNode.createMany({
          data: dto.nodes.map((n, idx) => ({
            flowId: flow.id,
            nodeKey: n.nodeKey || `node_${Date.now()}_${idx}`,
            nodeType: n.nodeType,
            config: n.config as any,
            positionX: n.positionX ?? 100,
            positionY: n.positionY ?? (idx + 1) * 120,
          })),
        });
      } else {
        // Create initial Start node
        await tx.emailFlowNode.create({
          data: {
            flowId: flow.id,
            nodeKey: 'start_entry',
            nodeType: 'start',
            config: {},
            positionX: 100,
            positionY: 80,
          },
        });
      }

      return flow.id;
    });

    return this.findById(flowId);
  }

  async update(id: string, dto: UpdateEmailFlowDto) {
    await this.findById(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.emailFlow.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          status: dto.status,
          triggerType: dto.triggerType,
          triggerConfig: dto.triggerConfig as any,
          isGlobal: dto.isGlobal,
          campaignIds: dto.campaignIds,
          projectId: dto.projectId,
        },
      });

      if (dto.nodes) {
        await tx.emailFlowNode.deleteMany({
          where: { flowId: id },
        });

        if (dto.nodes.length > 0) {
          await tx.emailFlowNode.createMany({
            data: dto.nodes.map((n, idx) => ({
              flowId: id,
              nodeKey: n.nodeKey || `node_${Date.now()}_${idx}`,
              nodeType: n.nodeType,
              config: n.config as any,
              positionX: n.positionX ?? 100,
              positionY: n.positionY ?? (idx + 1) * 120,
            })),
          });
        }
      }
    });

    return this.findById(id);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.emailFlow.delete({
      where: { id },
    });
  }

  async duplicate(id: string) {
    const existing = await this.findById(id);

    const cloneId = await this.prisma.$transaction(async (tx) => {
      const clone = await tx.emailFlow.create({
        data: {
          name: `Copy of ${existing.name}`,
          description: existing.description,
          triggerType: existing.triggerType,
          triggerConfig: existing.triggerConfig as any,
          isGlobal: existing.isGlobal,
          campaignIds: existing.campaignIds,
          projectId: existing.projectId,
          status: 'draft',
        },
      });

      if (existing.nodes && existing.nodes.length > 0) {
        await tx.emailFlowNode.createMany({
          data: existing.nodes.map((n) => ({
            flowId: clone.id,
            nodeKey: n.nodeKey,
            nodeType: n.nodeType,
            config: n.config as any,
            positionX: n.positionX,
            positionY: n.positionY,
          })),
        });
      }

      return clone.id;
    });

    return this.findById(cloneId);
  }

  async getFlowRuns(flowId: string) {
    return this.prisma.emailFlowRun.findMany({
      where: { flowId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
