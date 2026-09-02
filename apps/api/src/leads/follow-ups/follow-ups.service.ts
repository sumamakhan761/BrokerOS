import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

import { NotificationsService } from '../../notifications/notifications.service.js';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto.js';

@Injectable()
export class FollowUpsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getFollowUps(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');
    return this.prisma.followUp.findMany({
      where: { leadId },
      orderBy: { scheduledDate: 'desc' },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });
  }

  async createFollowUp(leadId: string, data: CreateFollowUpDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    const followUp = await this.prisma.followUp.create({
      data: {
        leadId,
        userId: data.userId,
        scheduledDate: new Date(data.scheduledDate),
        type: data.type,
        remarks: data.remarks,
        status: 'SCHEDULED',
      },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });

    // Keep the lead's nextFollowUpDate in sync
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { nextFollowUpDate: new Date(data.scheduledDate) },
    });

    return followUp;
  }

  async updateFollowUp(followUpId: string, data: UpdateFollowUpDto) {
    const updated = await this.prisma.followUp.update({
      where: { id: followUpId },
      data: {
        ...(data.scheduledDate && {
          scheduledDate: new Date(data.scheduledDate),
        }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.remarks !== undefined && { remarks: data.remarks }),
        ...(data.status !== undefined && { status: data.status as any }),
        ...(data.status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        user: {
          select: { username: true, email: true, displayUsername: true },
        },
      },
    });

    if (data.status === 'COMPLETED') {
      this.notificationsService
        .checkDailyTaskCompletion(updated.userId, 'FOLLOW_UPS')
        .catch((err) => {
          console.error(
            'Failed to check daily follow-up task completion:',
            err,
          );
        });
    }

    return updated;
  }

  async deleteFollowUp(followUpId: string) {
    return this.prisma.followUp.delete({
      where: { id: followUpId },
    });
  }
}
