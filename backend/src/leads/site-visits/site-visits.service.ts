import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { LeadsService } from '../core/leads.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

@Injectable()
export class SiteVisitsService {
  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private notificationsService: NotificationsService,
  ) {}

  async getSiteVisits(leadId: string) {
    await this.leadsService.findOne(leadId); // Ensure lead exists
    return this.prisma.siteVisit.findMany({
      where: { leadId },
      orderBy: { scheduledDate: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { username: true, displayUsername: true } },
      },
    });
  }

  async createSiteVisit(leadId: string, data: { userId: string; projectId: string; scheduledDate: string; meetingNotes?: string; destinationUrl?: string }) {
    try {
      await this.leadsService.findOne(leadId); // Ensure lead exists

      let assignedExecId = data.userId; // Default

      // Fetch Sales Executives mapped to the project
      const projectExecs = await this.prisma.projectAssignment.findMany({
        where: { projectId: data.projectId, isActive: true, user: { role: { code: 'SALES_EXECUTIVE' } } },
        orderBy: { assignedAt: 'asc' }, // Keep order deterministic
      });

      if (projectExecs.length > 0) {
        // Find last assigned SV for this project among these execs
        const lastSV = await this.prisma.siteVisit.findFirst({
          where: { projectId: data.projectId, salesExecId: { in: projectExecs.map(pe => pe.userId) } },
          orderBy: { createdAt: 'desc' },
        });

        if (lastSV) {
          const lastIdx = projectExecs.findIndex(pe => pe.userId === lastSV.salesExecId);
          assignedExecId = projectExecs[(lastIdx + 1) % projectExecs.length].userId;
        } else {
          assignedExecId = projectExecs[0].userId;
        }
      }

      const siteVisit = await this.prisma.siteVisit.create({
        data: {
          leadId,
          projectId: data.projectId,
          createdById: data.userId,
          salesExecId: assignedExecId,
          scheduledDate: new Date(data.scheduledDate),
          meetingNotes: data.meetingNotes,
          destinationUrl: data.destinationUrl,
          status: 'SCHEDULED',
        },
        include: {
          project: { select: { id: true, name: true } },
          createdBy: { select: { username: true, displayUsername: true } },
        },
      });

      // Move lead status forward and re-assign lead to the Sales Exec handling the SV
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { 
          status: 'SITE_VISIT_SCHEDULED',
          assignedUserId: assignedExecId,
        },
      });

      const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
      if (lead) {
        const customerName = lead.lastName ? `${lead.firstName} ${lead.lastName}` : lead.firstName;
        const projectName = siteVisit.project.name;
        const formattedDate = new Date(data.scheduledDate).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });

        await this.notificationsService.createNotification({
          userId: assignedExecId,
          type: 'SITE_VISIT_ASSIGNED',
          title: 'New site visit assigned.',
          body: `${customerName} — ${projectName} — ${formattedDate}`,
          actionUrl: `/dashboard/sales-executive/lead-management`,
          metadata: {
            siteVisitId: siteVisit.id,
            leadId: leadId,
            customerName,
            projectName,
            scheduledAt: data.scheduledDate,
          }
        });
      }

      return siteVisit;
    } catch (e: any) {
      console.error('CREATE SITE VISIT ERROR:', e);
      throw e;
    }
  }

  async updateSiteVisit(siteVisitId: string, data: {
    scheduledDate?: string;
    projectId?: string;
    meetingNotes?: string;
    status?: string;
    interestLevel?: string;
    budgetConfirmed?: number;
    configInterest?: string;
    customerReaction?: string;
    customerObjections?: string;
    closingProbability?: string;
    completedAt?: string;
    nextAction?: string;
  }) {
    const updated = await this.prisma.siteVisit.update({
      where: { id: siteVisitId },
      data: {
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.projectId && { projectId: data.projectId }),
        ...(data.meetingNotes !== undefined && { meetingNotes: data.meetingNotes }),
        ...(data.status && { status: data.status as any }),
        ...(data.interestLevel && { interestLevel: data.interestLevel as any }),
        ...(data.budgetConfirmed !== undefined && { budgetConfirmed: data.budgetConfirmed }),
        ...(data.configInterest !== undefined && { configInterest: data.configInterest }),
        ...(data.customerReaction !== undefined && { customerReaction: data.customerReaction }),
        ...(data.customerObjections !== undefined && { customerObjections: data.customerObjections }),
        ...(data.closingProbability !== undefined && { closingProbability: data.closingProbability }),
        ...(data.completedAt && { completedAt: new Date(data.completedAt) }),
        ...(data.nextAction !== undefined && { nextAction: data.nextAction }),
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { username: true, displayUsername: true } },
      },
    });

    if (data.status === 'COMPLETED') {
      this.notificationsService.checkDailyTaskCompletion(updated.salesExecId, 'SITE_VISITS').catch(err => {
        console.error("Failed to check daily site visits task completion:", err);
      });
    }

    return updated;
  }

  async deleteSiteVisit(siteVisitId: string) {
    return this.prisma.siteVisit.delete({
      where: { id: siteVisitId },
    });
  }

  async arriveAtSiteVisit(siteVisitId: string, locationData: { latitude: number; longitude: number }) {
    return this.prisma.siteVisit.update({
      where: { id: siteVisitId },
      data: {
        arrivedAt: new Date(),
        arriveLatitude: locationData.latitude,
        arriveLongitude: locationData.longitude,
      },
    });
  }
}
