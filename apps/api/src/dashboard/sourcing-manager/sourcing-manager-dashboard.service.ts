import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange } from '../core/dashboard.utils.js';

@Injectable()
export class SourcingManagerDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the CP project IDs assigned to this user via ProjectAssignment.
   * Only returns projects where isCpProject = true.
   */
  private async getAssignedCpProjectIds(userId: string): Promise<string[]> {
    const assignments = await this.prisma.projectAssignment.findMany({
      where: {
        userId,
        isActive: true,
        project: { isCpProject: true },
      },
      select: { projectId: true },
    });
    return assignments.map((a) => a.projectId);
  }

  async getDashboard(userId: string) {
    const { start, end } = getTodayRange();

    // Step 1: Get assigned CP project IDs for this sourcing manager
    const cpProjectIds = await this.getAssignedCpProjectIds(userId);

    // 1. Fetch Active Brokers (Brokers assigned to this manager with status DEAL)
    const activeBrokers = await this.prisma.broker.count({
      where: {
        sourcingManagerId: userId,
        status: 'DEAL',
      },
    });

    // 2. Fetch New Brokers (Brokers assigned to this manager with status NEW)
    const newBrokers = await this.prisma.broker.count({
      where: {
        sourcingManagerId: userId,
        status: 'NEW',
      },
    });

    // 3. Today's Meetings
    const todayMeetings = await this.prisma.brokerMeeting.count({
      where: {
        userId: userId, // Scoped to this manager
        scheduledDate: { gte: start, lte: end },
      },
    });

    // 4. Today's Follow-ups
    const todayFollowUps = await this.prisma.followUp.count({
      where: {
        broker: {
          sourcingManagerId: userId, // Scoped to brokers of this manager
        },
        scheduledDate: { gte: start, lte: end },
      },
    });

    // 5. Revenue & Performance Stats

    // First, find all brokers managed by this user
    const brokers = await this.prisma.broker.findMany({
      where: { sourcingManagerId: userId },
      select: { id: true },
    });
    const brokerIds = brokers.map((b) => b.id);

    // Fetch bookings SCOPED TO ASSIGNED CP PROJECTS and related to these brokers
    const bookings = await this.prisma.booking.findMany({
      where: {
        // PROJECT SCOPE: Only bookings in units belonging to assigned CP projects
        unit: {
          floor: {
            tower: {
              projectId: { in: cpProjectIds },
            },
          },
        },
        // BROKER SCOPE: Only bookings linked to this manager's brokers
        OR: [
          {
            customer: {
              lead: {
                brokerId: { in: brokerIds },
              },
            },
          },
          {
            brokerageRecords: {
              some: {
                brokerId: { in: brokerIds },
              },
            },
          },
        ],
      },
      include: {
        customer: {
          include: { lead: true },
        },
        brokerageRecords: {
          where: { brokerId: { in: brokerIds } },
        },
      },
    });

    let bookingsGenerated = 0;
    let unitsSold = 0;
    let bookingRevenueGenerated = 0; // Using tokenAmount
    let brokerCommissionPaid = 0; // Commission paid out to the broker
    let brokerRevenueGenerated = 0; // Agreed price when handover is done

    for (const booking of bookings) {
      bookingsGenerated += 1;

      const bookingAmount = Number(booking.tokenAmount) || 0;
      bookingRevenueGenerated += bookingAmount;

      const isHandoverDone =
        booking.status === 'HANDOVER_COMPLETED' ||
        (booking.customer?.lead?.status === 'HANDOVER' &&
          booking.customer?.lead?.subStatus === 'DONE');

      if (isHandoverDone) {
        unitsSold += 1;
        // Agreed price comes when the handover is done
        brokerRevenueGenerated += Number(booking.totalPayable) || 0;
      }

      let commission = Number(booking.commissionAmount) || 0;

      for (const record of booking.brokerageRecords) {
        if (record.status === 'PAID') {
          commission +=
            Number(record.paidAmount) || Number(record.netPayable) || 0;
        } else {
          commission +=
            Number(record.paidAmount) || Number(record.netPayable) || 0;
        }
      }

      brokerCommissionPaid += commission;
    }

    const todayFollowUpList = await this.prisma.followUp.findMany({
      where: {
        broker: { sourcingManagerId: userId },
        scheduledDate: { gte: start, lte: end },
      },
      include: {
        broker: { select: { name: true, phone: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const todayMeetingList = await this.prisma.brokerMeeting.findMany({
      where: {
        userId: userId,
        scheduledDate: { gte: start, lte: end },
      },
      include: {
        broker: { select: { name: true, phone: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Top Performing Brokers (Ranked by Bookings Generated and Units Sold)
    const brokersData = await this.prisma.broker.findMany({
      where: { sourcingManagerId: userId },
      select: {
        id: true,
        name: true,
        profilePhotoUrl: true,
      },
    });

    const brokerStatsMap = new Map<string, { bCount: number; units: number }>();
    for (const broker of brokersData) {
      brokerStatsMap.set(broker.id, { bCount: 0, units: 0 });
    }

    // Use project-scoped bookings for broker performance
    for (const booking of bookings) {
      const isHandoverDone =
        booking.status === 'HANDOVER_COMPLETED' ||
        (booking.customer?.lead?.status === 'HANDOVER' &&
          booking.customer?.lead?.subStatus === 'DONE');

      const involvedBrokerIds = new Set<string>();

      if (
        booking.customer?.lead?.brokerId &&
        brokerStatsMap.has(booking.customer.lead.brokerId)
      ) {
        involvedBrokerIds.add(booking.customer.lead.brokerId);
      }

      for (const record of booking.brokerageRecords) {
        if (brokerStatsMap.has(record.brokerId)) {
          involvedBrokerIds.add(record.brokerId);
        }
      }

      for (const bId of involvedBrokerIds) {
        const stats = brokerStatsMap.get(bId)!;
        stats.bCount += 1;
        if (isHandoverDone) {
          stats.units += 1;
        }
      }
    }

    const topPerformingBrokers = brokersData
      .map((broker) => {
        const stats = brokerStatsMap.get(broker.id)!;
        const score = stats.bCount * 10 + stats.units * 50; // Weighted score
        return {
          id: broker.id,
          name: broker.name,
          image: broker.profilePhotoUrl,
          bookingsGenerated: stats.bCount,
          unitsSold: stats.units,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((broker, idx) => ({
        ...broker,
        rank: idx + 1,
      }));

    return {
      activeBrokers,
      newBrokers,
      todayMeetings,
      todayFollowUps,
      revenueStats: {
        bookingsGenerated,
        unitsSold,
        bookingRevenueGenerated,
        brokerCommissionPaid,
        brokerRevenueGenerated,
      },
      todayFollowUpList,
      todayMeetingList,
      topPerformingBrokers,
    };
  }
}
