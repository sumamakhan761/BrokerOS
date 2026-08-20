import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange } from '../core/dashboard.utils.js';

@Injectable()
export class PostSalesDashboardService {
  constructor(private prisma: PrismaService) { }

  async getPostSalesDashboard(userId: string, roleId?: string) {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    let roleCode = 'ADMIN';
    if (roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (role) roleCode = role.code;
    } else {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
      if (user?.role) roleCode = user.role.code;
    }

    // Generic where clause for post-sales leads
    const leadWhere: any = { deletedAt: null };
    // Post-sales agents only view leads corresponding to bookings assigned to them
    if (roleCode === 'POST_SALES') {
      leadWhere.customer = { bookings: { some: { assignedPostSalesId: userId, source: 'DIRECT' } } };
    } else if (roleCode === 'POST_SALES_MANAGER') {
      leadWhere.customer = { bookings: { some: { source: 'DIRECT' } } };
    } else if (roleCode === 'SALES_EXECUTIVE') {
      leadWhere.assignedUserId = userId;
    }

    const [
      totalBooked,
      documentsPending,
      loanCases,
      agreementPending,
      possessionPending,
      handoverCompleted,
      documentsList,
      loanList,
      agreementList,
      possessionList,
      todayFollowUpList,
    ] = await Promise.all([
      // Total Booked Customers (Statuses: BOOKING, DOCUMENT, LOAN, AGREEMENT, HANDOVER)
      this.prisma.lead.count({
        where: { ...leadWhere, status: { in: ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'] } },
      }),
      // Documents Pending
      this.prisma.lead.count({
        where: { ...leadWhere, status: 'DOCUMENT' },
      }),
      // Loan Cases in Progress
      this.prisma.lead.count({
        where: { ...leadWhere, status: 'LOAN' },
      }),
      // Agreement Pending
      this.prisma.lead.count({
        where: { ...leadWhere, status: 'AGREEMENT' },
      }),
      // Possession Pending (HANDOVER but not DONE)
      this.prisma.lead.count({
        where: { ...leadWhere, status: 'HANDOVER', subStatus: { not: 'DONE' } },
      }),
      // Handover Completed (HANDOVER and DONE)
      this.prisma.lead.count({
        where: { ...leadWhere, status: 'HANDOVER', subStatus: 'DONE' },
      }),
      // Lists (take 5 each)
      this.getLeadList({ ...leadWhere, status: 'DOCUMENT' }),
      this.getLeadList({ ...leadWhere, status: 'LOAN' }),
      this.getLeadList({ ...leadWhere, status: 'AGREEMENT' }),
      this.getLeadList({ ...leadWhere, status: 'HANDOVER', subStatus: { not: 'DONE' } }),
      // Today's Follow-ups
      this.prisma.followUp.findMany({
        where: {
          userId, // follow-ups are specific to the user
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null, status: { in: ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'] } },
        },
        take: 5,
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              temperature: true,
              status: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      widgets: {
        totalBooked,
        documentsPending,
        loanCases,
        agreementPending,
        possessionPending,
        handoverCompleted,
      },
      documentsList,
      loanList,
      agreementList,
      possessionList,
      todayFollowUpList,
    };
  }

  private getLeadList(whereArgs: any) {
    return this.prisma.lead.findMany({
      where: whereArgs,
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        subStatus: true,
        avatar: true,
      },
    });
  }
}
