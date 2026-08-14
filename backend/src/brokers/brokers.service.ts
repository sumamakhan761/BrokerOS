import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';

@Injectable()
export class BrokersService {
  private readonly logger = new Logger(BrokersService.name);

  constructor(private prisma: PrismaService) { }

  private async getUserRoleCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    return user?.role?.code || '';
  }

  async getBrokers(userId: string, projectId?: string, followUpDate?: string) {
    const roleCode = await this.getUserRoleCode(userId);
    let whereClause: any = {};

    if (roleCode === 'CHANNEL_PARTNER') {
      if (projectId) {
        whereClause.projectAssignments = { some: { projectId } };
      } else {
        whereClause.OR = [
          { sourcingManagerId: { not: null } },
          { projectAssignments: { some: { project: { isCpProject: true } } } }
        ];
      }
    } else if (roleCode === 'CLOSING_MANAGER') {
      const pAssigns = await this.prisma.projectAssignment.findMany({ where: { userId } });
      const tAssigns = await this.prisma.towerAssignment.findMany({ where: { userId }, include: { tower: true } });
      const cmProjectIds = [
        ...pAssigns.map(pa => pa.projectId),
        ...tAssigns.map(ta => ta.tower.projectId)
      ];
      let finalProjectIds = cmProjectIds;
      if (projectId) {
        finalProjectIds = cmProjectIds.filter(id => id === projectId);
      }
      whereClause = {
        projectAssignments: {
          some: {
            projectId: { in: finalProjectIds }
          }
        }
      };
    } else {
      whereClause = { sourcingManagerId: userId };
      if (projectId) {
        whereClause.projectAssignments = { some: { projectId } };
      }
    }

    if (followUpDate) {
      const date = new Date(followUpDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        whereClause.followUps = {
          some: {
            scheduledDate: { gte: date, lt: nextDay }
          }
        };
      }
    }

    return this.prisma.broker.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        projectAssignments: true,
        sourcingManager: { select: { id: true, name: true, image: true } }
      }
    });
  }

  async getBrokerById(id: string, userId: string) {
    const roleCode = await this.getUserRoleCode(userId);
    let whereClause: any = { id };

    if (roleCode === 'CLOSING_MANAGER') {
      const pAssigns = await this.prisma.projectAssignment.findMany({ where: { userId } });
      const tAssigns = await this.prisma.towerAssignment.findMany({ where: { userId }, include: { tower: true } });
      const cmProjectIds = [
        ...pAssigns.map(pa => pa.projectId),
        ...tAssigns.map(ta => ta.tower.projectId)
      ];
      whereClause = {
        id,
        projectAssignments: {
          some: {
            projectId: { in: cmProjectIds }
          }
        }
      };
    } else if (roleCode === 'CHANNEL_PARTNER') {
      whereClause = {
        id,
        OR: [
          { sourcingManagerId: { not: null } },
          { projectAssignments: { some: { project: { isCpProject: true } } } }
        ]
      }
    } else {
      whereClause = { id, sourcingManagerId: userId };
    }

    const broker = await this.prisma.broker.findUnique({
      where: whereClause,
      include: {
        notes: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        },
        followUps: {
          orderBy: { scheduledDate: 'asc' }
        },
        callRecords: {
          orderBy: { createdAt: 'desc' }
        },
        projectAssignments: {
          include: { project: true }
        },
        meetings: {
          orderBy: { scheduledDate: 'asc' }
        },
        sourcingManager: { select: { id: true, name: true, image: true } }
      }
    });

    if (!broker) {
      throw new NotFoundException('Broker not found or not assigned to you');
    }
    return broker;
  }

  async createBroker(data: any, userId: string) {
    const roleCode = await this.getUserRoleCode(userId);
    let sourcingManagerId: string | null = null;

    if (roleCode === 'SOURCING_MANAGER') {
      sourcingManagerId = userId;
    } else if (roleCode === 'CHANNEL_PARTNER' && data.sourcingManagerId) {
      sourcingManagerId = data.sourcingManagerId;
    }

    return this.prisma.broker.create({
      data: {
        brokerCode: `BRK-${Date.now().toString().slice(-6)}`,
        companyName: data.companyName,
        name: data.name,
        phone: data.phone,
        city: data.city,
        reraNumber: data.reraNumber,
        gstNumber: data.gstNumber,
        serviceAreas: Array.isArray(data.serviceAreas)
          ? data.serviceAreas
          : typeof data.serviceAreas === 'string'
            ? data.serviceAreas.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
        status: 'NEW',
        subStatus: 'PENDING',
        sourcingManagerId,
        projectAssignments: Array.isArray(data.assignedProjects) && data.assignedProjects.length > 0 ? {
          create: data.assignedProjects.map((projectId: string) => ({
            projectId
          }))
        } : undefined,
      }
    });
  }

  async updateBroker(id: string, userId: string, data: any) {
    const roleCode = await this.getUserRoleCode(userId);
    const whereClause = roleCode === 'CHANNEL_PARTNER' ? { id } : { id, sourcingManagerId: userId };
    const broker = await this.prisma.broker.findUnique({
      where: whereClause
    });
    if (!broker) {
      throw new NotFoundException('Broker not found');
    }
    return this.prisma.broker.update({
      where: { id },
      data
    });
  }

  async updateDealCard(brokerId: string, userId: string, data: any) {
    const roleCode = await this.getUserRoleCode(userId);
    const whereClause = roleCode === 'CHANNEL_PARTNER' ? { id: brokerId } : { id: brokerId, sourcingManagerId: userId };
    const broker = await this.prisma.broker.findUnique({
      where: whereClause
    });
    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    if (broker.status !== 'DEAL') {
      throw new BadRequestException('Broker must be in DEAL status to update deal card');
    }

    const { projectId, towerId, brokeragePercent, brokerageFlat, dealDocuments, isLocked } = data;

    let assignment = await this.prisma.brokerProjectAssignment.findFirst({
      where: {
        brokerId,
        projectId
      }
    });

    if (assignment) {
      // If locked, only CP can unlock/edit.
      if (assignment.isLocked && roleCode !== 'CHANNEL_PARTNER') {
        throw new BadRequestException('Deal card is locked and cannot be edited by Sourcing Manager');
      }
      assignment = await this.prisma.brokerProjectAssignment.update({
        where: { id: assignment.id },
        data: {
          towerId,
          dealDocuments: dealDocuments || [],
          brokeragePercent: brokeragePercent ? parseFloat(brokeragePercent) : null,
          brokerageFlat: brokerageFlat ? parseFloat(brokerageFlat) : null,
          isLocked: isLocked || false,
        }
      });
    } else {
      assignment = await this.prisma.brokerProjectAssignment.create({
        data: {
          brokerId,
          projectId,
          towerId,
          dealDocuments: dealDocuments || [],
          brokeragePercent: brokeragePercent ? parseFloat(brokeragePercent) : null,
          brokerageFlat: brokerageFlat ? parseFloat(brokerageFlat) : null,
          isLocked: isLocked || false,
        }
      });
    }
    return assignment;
  }

  async getSourcingManagers() {
    return this.prisma.user.findMany({
      where: { role: { code: 'SOURCING_MANAGER' } },
      select: { id: true, name: true, image: true, email: true }
    });
  }
}
