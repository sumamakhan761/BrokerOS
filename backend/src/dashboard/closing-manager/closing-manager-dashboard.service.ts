import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ClosingManagerDashboardService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get the CP project IDs assigned to this user via ProjectAssignment.
   * Only returns projects where isCpProject = true.
   */
  private async getAssignedCpProjectIds(userId: string): Promise<string[]> {
    const assignments = await this.prisma.projectAssignment.findMany({
      where: {
        userId,
        isActive: true,
        project: { isCpProject: true }
      },
      select: { projectId: true }
    });
    return assignments.map(a => a.projectId);
  }

  async getDashboard(userId: string) {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      // Step 1: Get assigned CP project IDs for this closing manager
      const cpProjectIds = await this.getAssignedCpProjectIds(userId);

      // Project-scoped booking filter: only bookings in units belonging to assigned CP projects
      const projectScopedBookingFilter: any = {
        status: { not: 'CANCELLED' },
        unit: {
          floor: {
            tower: {
              projectId: { in: cpProjectIds }
            }
          }
        }
      };

      // 1. Widgets - Fetch ALL matching bookings to calculate manually
      const bookings = await this.prisma.booking.findMany({
        where: projectScopedBookingFilter,
        include: {
          customer: {
            include: { lead: true }
          },
          brokerageRecords: true
        }
      });

      let totalBookings = 0;
      let totalUnitsSold = 0;
      let totalBookingRevenue = 0;
      let totalRevenueGenerated = 0;
      let totalBrokerCommission = 0;
      const uniqueBrokers = new Set<string>();

      for (const booking of bookings) {
        totalBookings += 1;

        // 1 booking = 1 unit for now
        totalUnitsSold += 1;
        // 
        // Booking Revenue (Token Amount)
        totalBookingRevenue += Number(booking.tokenAmount) || 0;

        // Total Revenue Generated (Agreed Price)
        totalRevenueGenerated += Number(booking.agreedPrice) || 0;

        // Total Broker Commission
        totalBrokerCommission += Number(booking.commissionAmount) || 0;

        // Track unique brokers via Lead or Brokerage Records
        if (booking.customer?.lead?.brokerId) {
          uniqueBrokers.add(booking.customer.lead.brokerId);
        }
        for (const record of booking.brokerageRecords) {
          if (record.brokerId) {
            uniqueBrokers.add(record.brokerId);
          }
        }
      }

      const widgets = {
        totalBookings,
        totalUnitsSold,
        totalBookingRevenue,
        totalBrokerCommission,
        totalRevenueGenerated,
        totalBrokers: uniqueBrokers.size
      };

      // 2. Lists — All scoped to assigned CP projects
      const [
        documentPendingList,
        loanPendingList,
        agreementPendingList,
        handoverPendingList,
        todayFollowupsList
      ] = await Promise.all([
        // Document Pending
        this.prisma.booking.findMany({
          where: { ...projectScopedBookingFilter, status: 'DOCUMENTATION_PENDING' },
          include: { customer: true, unit: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        // Loan Pending
        this.prisma.booking.findMany({
          where: { ...projectScopedBookingFilter, status: 'LOAN_IN_PROGRESS' },
          include: { customer: true, unit: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        // Agreement Pending
        this.prisma.booking.findMany({
          where: { ...projectScopedBookingFilter, status: 'AGREEMENT_PENDING' },
          include: { customer: true, unit: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        // Handover Pending (Possession Pending in Schema)
        this.prisma.booking.findMany({
          where: { ...projectScopedBookingFilter, status: 'POSSESSION_PENDING' },
          include: { customer: true, unit: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        // Today's Follow-ups — scoped to leads in assigned CP projects
        this.prisma.followUp.findMany({
          where: {
            lead: { interestedProjectId: { in: cpProjectIds } },
            status: 'SCHEDULED',
            scheduledDate: { gte: todayStart, lte: todayEnd }
          },
          include: { lead: true },
          take: 5,
          orderBy: { scheduledDate: 'asc' }
        })
      ]);

      // Count for lists — All scoped to assigned CP projects
      const listCounts = {
        documentPending: await this.prisma.booking.count({
          where: { ...projectScopedBookingFilter, status: 'DOCUMENTATION_PENDING' }
        }),
        loanPending: await this.prisma.booking.count({
          where: { ...projectScopedBookingFilter, status: 'LOAN_IN_PROGRESS' }
        }),
        agreementPending: await this.prisma.booking.count({
          where: { ...projectScopedBookingFilter, status: 'AGREEMENT_PENDING' }
        }),
        handoverPending: await this.prisma.booking.count({
          where: { ...projectScopedBookingFilter, status: 'POSSESSION_PENDING' }
        }),
        todayFollowups: await this.prisma.followUp.count({
          where: {
            lead: { interestedProjectId: { in: cpProjectIds } },
            scheduledDate: { gte: todayStart, lte: todayEnd },
            status: 'SCHEDULED'
          }
        })
      };

      return {
        widgets,
        lists: {
          documentPending: documentPendingList,
          loanPending: loanPendingList,
          agreementPending: agreementPendingList,
          handoverPending: handoverPendingList,
          todayFollowups: todayFollowupsList,
        },
        listCounts
      };

    } catch (error: any) {
      console.error('Error fetching closing manager dashboard:', error);
      throw new InternalServerErrorException('Failed to load dashboard data');
    }
  }
}
