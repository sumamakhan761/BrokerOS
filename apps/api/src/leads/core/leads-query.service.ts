import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { Prisma, LeadStatus } from '@brokeros/prisma';
import { GetLeadsFilterDto } from './dto/lead.dto.js';

const SE_VISIBLE_STATUSES: LeadStatus[] = [
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_COMPLETED',
  'NEGOTIATION',
  'BOOKING',
];

@Injectable()
export class LeadsQueryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: GetLeadsFilterDto) {
    const where: Prisma.LeadWhereInput = {};

    if (filters?.assignedToId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: filters.assignedToId },
        include: { role: true },
      });
      if (assignedUser?.role?.code === 'POST_SALES') {
        where.customer = {
          bookings: {
            some: {
              assignedPostSalesId: filters.assignedToId,
              source: 'DIRECT',
            },
          },
        };
      } else {
        where.assignedUserId = filters.assignedToId;
      }
    } else if (filters?.roleId && filters?.userId) {
      const role = await this.prisma.role.findUnique({
        where: { id: filters.roleId },
      });

      if (role?.code === 'PRE_SALES') {
        where.assignedUserId = filters.userId;
      } else if (role?.code === 'PRE_SALES_MANAGER') {
        if (filters.managerUnassigned) {
          where.assignedUserId = filters.userId;
        } else {
          const subordinates = await this.prisma.user.findMany({
            where: { managerId: filters.userId },
            select: { id: true },
          });
          const subordinateIds = subordinates.map((s) => s.id);
          where.assignedUserId = { in: subordinateIds };
        }
      } else if (role?.code === 'SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: filters.userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.status = { in: SE_VISIBLE_STATUSES };
        where.OR = [
          { siteVisits: { some: { salesExecId: { in: subordinateIds } } } },
          { assignedUserId: { in: subordinateIds } },
        ];
        where.NOT = [
          { status: 'BOOKING', subStatus: 'DONE' },
          { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
        ];
      } else if (role?.code === 'SALES_EXECUTIVE') {
        const assignments = await this.prisma.projectAssignment.findMany({
          where: { userId: filters.userId, isActive: true },
          select: { projectId: true },
        });
        const projectIds = assignments.map((a) => a.projectId);

        where.status = { in: SE_VISIBLE_STATUSES };
        where.OR = [
          { siteVisits: { some: { projectId: { in: projectIds } } } },
          { assignedUserId: filters.userId },
        ];
        where.NOT = [
          { status: 'BOOKING', subStatus: 'DONE' },
          { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
        ];
      } else if (role?.code === 'CLOSING_MANAGER') {
        where.OR = [
          { createdById: filters.userId },
          { assignedUserId: filters.userId },
        ];
      } else if (role?.code === 'SOURCING_MANAGER') {
        where.OR = [
          { createdById: filters.userId },
          { broker: { sourcingManagerId: filters.userId } },
        ];
      } else if (role?.code === 'CHANNEL_PARTNER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: filters.userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { createdById: { in: subordinateIds } },
          { assignedUserId: { in: subordinateIds } },
          { broker: { sourcingManagerId: { in: subordinateIds } } },
        ];
      } else if (role?.code === 'POST_SALES') {
        where.customer = {
          bookings: {
            some: { assignedPostSalesId: filters.userId, source: 'DIRECT' },
          },
        };
      } else if (role?.code === 'POST_SALES_MANAGER') {
        where.customer = { bookings: { some: { source: 'DIRECT' } } };
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.followUpDate) {
      const date = new Date(filters.followUpDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        where.nextFollowUpDate = { gte: date, lt: nextDay };
      }
    }

    if (filters?.siteVisitDate) {
      const svDate = new Date(filters.siteVisitDate + 'T00:00:00');
      if (!isNaN(svDate.getTime())) {
        const svNextDay = new Date(svDate);
        svNextDay.setDate(svDate.getDate() + 1);
        where.siteVisits = {
          some: {
            scheduledDate: { gte: svDate, lt: svNextDay },
          },
        };
      }
    }

    if (filters?.scoreRange) {
      if (filters.scoreRange === '0-60') {
        where.score = { gte: 0, lte: 60 };
      } else if (filters.scoreRange === '60-80') {
        where.score = { gt: 60, lte: 80 };
      } else if (filters.scoreRange === '80-100') {
        where.score = { gt: 80, lte: 100 };
      }
    }

    if (filters?.isCpProject !== undefined) {
      where.interestedProject = { isCpProject: filters.isCpProject };
    }

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        subStatus: true,
        score: true,
        lastContactDate: true,
        nextFollowUpDate: true,
        createdAt: true,
        assignedUser: {
          select: { name: true, username: true },
        },
        interestedProject: {
          select: { id: true, name: true, slug: true },
        },
        siteVisits: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
          select: {
            scheduledDate: true,
            status: true,
            completedAt: true,
            projectId: true,
            salesExec: { select: { name: true, username: true } },
          },
        },
        followUps: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
          select: { scheduledDate: true, status: true },
        },
        customer: {
          select: {
            bookings: {
              select: {
                unit: {
                  select: {
                    constructionStatus: true,
                    possessionTimeline: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return leads.map((lead) => {
      const latestSV = lead.siteVisits.length > 0 ? lead.siteVisits[0] : null;
      const latestFollowUp =
        lead.followUps.length > 0 ? lead.followUps[0] : null;
      return {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        status: lead.status,
        subStatus: lead.subStatus,
        score: lead.score,
        lastContactDate: lead.lastContactDate,
        nextFollowUpDate:
          lead.nextFollowUpDate || latestFollowUp?.scheduledDate || null,
        createdAt: lead.createdAt,
        assignedUser: lead.assignedUser,
        interestedProject: (lead as any).interestedProject || null,
        latestSiteVisit: latestSV,
        siteVisitScheduledDate: latestSV?.scheduledDate ?? null,
        siteVisitCompletedDate: latestSV?.completedAt ?? null,
        latestFollowUp: latestFollowUp,
        processionStatus:
          lead.customer?.bookings?.[0]?.unit?.constructionStatus || null,
        processionTimeline:
          lead.customer?.bookings?.[0]?.unit?.possessionTimeline || null,
      };
    });
  }

  async findOne(id: string, userId?: string, roleId?: string) {
    const where: Prisma.LeadWhereUniqueInput = { id };

    if (roleId && userId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (role?.code === 'PRE_SALES') {
        where.assignedUserId = userId;
      } else if (role?.code === 'PRE_SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.assignedUserId = { in: subordinateIds };
      } else if (role?.code === 'SALES_EXECUTIVE') {
        where.OR = [
          { assignedUserId: userId },
          { siteVisits: { some: { salesExecId: userId } } },
          { customer: { bookings: { some: { salesExecId: userId } } } },
        ];
      } else if (role?.code === 'SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { siteVisits: { some: { salesExecId: { in: subordinateIds } } } },
          {
            customer: {
              bookings: { some: { salesExecId: { in: subordinateIds } } },
            },
          },
        ];
      } else if (role?.code === 'CLOSING_MANAGER') {
        where.OR = [{ createdById: userId }, { assignedUserId: userId }];
      } else if (role?.code === 'SOURCING_MANAGER') {
        where.OR = [
          { createdById: userId },
          { broker: { sourcingManagerId: userId } },
        ];
      } else if (role?.code === 'CHANNEL_PARTNER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { createdById: { in: subordinateIds } },
          { assignedUserId: { in: subordinateIds } },
          { broker: { sourcingManagerId: { in: subordinateIds } } },
        ];
      } else if (role?.code === 'POST_SALES') {
        where.customer = {
          bookings: { some: { assignedPostSalesId: userId, source: 'DIRECT' } },
        };
      } else if (role?.code === 'POST_SALES_MANAGER') {
        where.customer = { bookings: { some: { source: 'DIRECT' } } };
      }
    }

    const lead = await this.prisma.lead.findFirst({
      where: where as any,
      include: {
        source: true,
        interestedProject: true,
        interestedTower: true,
        interestedUnit: true,
        broker: true,
        assignedUser: true,
        customer: {
          include: {
            bookings: {
              include: { unit: true },
            },
          },
        },
        siteVisits: {
          orderBy: { scheduledDate: 'desc' },
          include: { project: true },
        },
        followUps: {
          orderBy: { scheduledDate: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { username: true, displayUsername: true } },
          },
        },
        callRecords: {
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (lead.callRecords) {
      lead.callRecords = lead.callRecords.map((cr) => {
        if (cr.recordingUrl && cr.recordingUrl.includes('vercel-storage.com')) {
          cr.recordingUrl = `/api/leads/call-records/${cr.id}/audio`;
        }
        return cr;
      });
    }

    const result: any = lead;
    result.processionStatus =
      lead.customer?.bookings?.[0]?.unit?.constructionStatus || null;
    result.processionTimeline =
      lead.customer?.bookings?.[0]?.unit?.possessionTimeline || null;

    return result;
  }
}
