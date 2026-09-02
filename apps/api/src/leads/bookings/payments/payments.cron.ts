import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../lib/database/prisma.service.js';

@Injectable()
export class PaymentsCron {
  private readonly logger = new Logger(PaymentsCron.name);

  constructor(private prisma: PrismaService) {}

  // Run every day at midnight IST
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Kolkata',
  })
  async handleDailyPaymentChecks() {
    this.logger.log(
      'Running daily payment checks for upcoming and overdue payments...',
    );

    const getDayRange = (daysOffset: number) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysOffset);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      return { gte: targetDate, lt: nextDay };
    };

    try {
      // 1. Payments Due in exactly 3 Days
      const dueIn3DaysQuery = getDayRange(3);
      const upcomingPayments = await this.prisma.paymentSchedule.findMany({
        where: {
          status: 'PENDING',
          dueDate: dueIn3DaysQuery,
        },
        include: {
          booking: {
            include: {
              customer: {
                include: {
                  lead: true,
                },
              },
            },
          },
        },
      });

      for (const payment of upcomingPayments) {
        const lead = payment.booking.customer?.lead;
        if (!lead || !lead.assignedUserId) continue;

        await this.prisma.followUp.create({
          data: {
            leadId: lead.id,
            userId: lead.assignedUserId,
            scheduledDate: new Date(),
            type: 'Upcoming Payment Reminder',
            remarks: `Payment for ${payment.milestoneName} (Amount: ${payment.remainingAmount}) is due in 3 days on ${payment.dueDate.toLocaleDateString()}. Please remind the client.`,
            status: 'SCHEDULED',
          },
        });
        this.logger.log(
          `Created T-3 follow-up for Booking ${payment.booking.bookingNumber}`,
        );
      }

      // 2. Payments Overdue by exactly 1 Day
      const overdueBy1DayQuery = getDayRange(-1);
      const overduePayments = await this.prisma.paymentSchedule.findMany({
        where: {
          status: 'PENDING',
          dueDate: overdueBy1DayQuery,
        },
        include: {
          booking: {
            include: {
              customer: {
                include: {
                  lead: true,
                },
              },
            },
          },
        },
      });

      for (const payment of overduePayments) {
        const lead = payment.booking.customer?.lead;
        if (!lead || !lead.assignedUserId) continue;

        await this.prisma.followUp.create({
          data: {
            leadId: lead.id,
            userId: lead.assignedUserId,
            scheduledDate: new Date(),
            type: 'URGENT: Payment Overdue',
            remarks: `Payment for ${payment.milestoneName} (Amount: ${payment.remainingAmount}) was due yesterday (${payment.dueDate.toLocaleDateString()}). Please follow up urgently. If payment was made, mark it as Paid in the system.`,
            status: 'SCHEDULED',
          },
        });
        this.logger.log(
          `Created T+1 overdue follow-up for Booking ${payment.booking.bookingNumber}`,
        );
      }
    } catch (error) {
      this.logger.error('Error during daily payment checks', error);
    }
  }
}
