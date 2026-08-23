import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { LeadStatus, NotificationType } from '../../generated/prisma/client.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto.js';

@Injectable()
export class LeadsManagementService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async bulkCreate(leads: CreateLeadDto[], managerId: string) {
    const sources = await this.prisma.leadSource.findMany();
    const projects = await this.prisma.project.findMany();

    const data = leads.map((lead) => {
      let sourceId: string | null = null;
      if (lead.source) {
        const match = sources.find((s) => s.name.toLowerCase() === String(lead.source).toLowerCase());
        if (match) sourceId = match.id;
      }

      let interestedProjectId: string | null = null;
      if (lead.project) {
        const match = projects.find((p) => p.name.toLowerCase() === String(lead.project).toLowerCase());
        if (match) interestedProjectId = match.id;
      }

      return {
        firstName: lead.firstName || 'Unknown',
        lastName: lead.lastName,
        phone: String(lead.phone),
        email: lead.email,
        status: 'NEW' as LeadStatus,
        assignedUserId: managerId,
        createdById: managerId,
        sourceId: sourceId,
        interestedProjectId: interestedProjectId,
        preferredLocation: lead.preferredLocation || null,
        budget: lead.budget ? Number(lead.budget) : null,
        requirements: lead.requirements || null,
      };
    });

    const result = await this.prisma.lead.createMany({
      data,
      skipDuplicates: true,
    });

    if (result.count > 0 && managerId) {
      await this.notificationsService.createNotification({
        userId: managerId, // Or the assigned user if bulk assign is targeted differently
        type: NotificationType.LEAD_ASSIGNED,
        title: `You have ${result.count} new leads assigned.`,
        body: 'Tap to view your newly assigned leads.',
        metadata: { count: result.count },
      });
    }

    return { success: true, count: result.count };
  }

  async assignLeads(leadIds: string[], managerId: string, targetUserId?: string, roundRobin?: boolean) {
    if (roundRobin) {
      const subordinates = await this.prisma.user.findMany({
        where: { managerId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      if (subordinates.length === 0) {
        throw new Error('No active subordinates found to assign leads to.');
      }

      let assignedCount = 0;
      const userAssignmentCount: Record<string, number> = {};

      for (let i = 0; i < leadIds.length; i++) {
        const userId = subordinates[i % subordinates.length].id;
        await this.prisma.lead.update({
          where: { id: leadIds[i] },
          data: { assignedUserId: userId },
        });
        assignedCount++;
        userAssignmentCount[userId] = (userAssignmentCount[userId] || 0) + 1;
      }

      // Notify each assigned user
      for (const [userId, count] of Object.entries(userAssignmentCount)) {
        await this.notificationsService.createNotification({
          userId,
          type: NotificationType.LEAD_ASSIGNED,
          title: `You have ${count} new leads assigned.`,
          body: 'Tap to view your newly assigned leads.',
          metadata: { count },
        });
      }

      return { success: true, assignedCount };
    } else if (targetUserId) {
      const result = await this.prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { assignedUserId: targetUserId },
      });

      if (result.count > 0) {
        await this.notificationsService.createNotification({
          userId: targetUserId,
          type: NotificationType.LEAD_ASSIGNED,
          title: `You have ${result.count} new leads assigned.`,
          body: 'Tap to view your newly assigned leads.',
          metadata: { count: result.count },
        });
      }

      return { success: true, assignedCount: result.count };
    }

    throw new Error('Must provide either targetUserId or roundRobin flag.');
  }

  async updateStatus(id: string, status: LeadStatus, subStatus?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    const data: any = { status };
    if (subStatus) data.subStatus = subStatus;

    return this.prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id },
        data,
      });

      if (status === 'HANDOVER' && subStatus === 'DONE') {
        const booking = await tx.booking.findFirst({
          where: { customer: { leadId: id }, status: { in: ['DOCUMENTATION_PENDING', 'CONFIRMED'] } },
          orderBy: { createdAt: 'desc' }
        });
        if (booking && booking.unitId) {
          await tx.unit.update({
            where: { id: booking.unitId },
            data: { status: 'SOLD' }
          });
        }
      }

      return updatedLead;
    });
  }

  async create(data: CreateLeadDto, userId?: string) {
    let sourceId = data.sourceId;
    if (!sourceId && data.source) {
      const source = await this.prisma.leadSource.findFirst({
        where: { name: { equals: data.source, mode: 'insensitive' } }
      });
      if (source) sourceId = source.id;
    }

    return this.prisma.lead.create({
      data: {
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName,
        phone: String(data.phone),
        email: data.email,
        status: 'NEW' as LeadStatus,
        assignedUserId: data.assignedUserId || userId,
        createdById: userId,
        sourceId: sourceId,
        interestedProjectId: data.interestedProjectId,
        interestedTowerId: data.interestedTowerId,
        interestedUnitId: data.interestedUnitId,
        brokerId: data.brokerId,
        preferredLocation: data.preferredLocation || null,
        budget: data.budget ? Number(data.budget) : null,
        requirements: data.requirements || null,
      },
      include: {
        source: true,
        interestedProject: true,
        broker: true,
      }
    });
  }

  async update(
    id: string,
    data: UpdateLeadDto,
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    return this.prisma.lead.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        preferredLocation: data.preferredLocation,
        requirements: data.requirements,
        budget: data.budget,
        sourceId: data.sourceId,
        subStatus: data.subStatus,
        interestedProjectId: data.interestedProjectId,
        temperature: data.temperature,
        lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
      },
      include: {
        source: true,
        interestedProject: true,
      },
    });
  }
}
