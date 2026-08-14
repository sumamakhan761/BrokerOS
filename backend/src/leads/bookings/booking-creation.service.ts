import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';

@Injectable()
export class BookingCreationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async createBooking(leadId: string, data: {
    userId: string;
    unitId?: string;
    unitDescription?: string;
    agreedPrice?: number;
    bookingAmount?: number;
    commissionPercentage?: number;
    commissionAmount?: number;
    paymentMode?: string;
    transactionRef?: string;
    loanRequired?: boolean;
    remarks?: string;
  }) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    let customer = await this.prisma.customer.findUnique({ where: { leadId } });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          leadId,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          email: lead.email,
        }
      });
    }

    // Using transaction to prevent race conditions when grabbing an available unit
    const result = await this.prisma.$transaction(async (tx) => {
      let unit: any = undefined;

      if (data.unitId) {
        unit = await tx.unit.findUnique({
          where: { id: data.unitId },
          include: { floor: { include: { tower: true } } }
        });
        if (!unit) throw new Error('Unit not found');
        if (unit.status !== 'AVAILABLE') throw new Error('Selected unit is no longer available');

        let finalCommPercent = data.commissionPercentage;
        let finalCommAmount = data.commissionAmount;

        // Auto-fetch commission from Deal Card if broker is attached
        if (lead.brokerId && unit.floor?.tower?.projectId) {
          const dealCard = await tx.brokerProjectAssignment.findUnique({
            where: {
              brokerId_projectId: {
                brokerId: lead.brokerId,
                projectId: unit.floor.tower.projectId
              }
            }
          });

          if (dealCard && dealCard.brokeragePercent) {
            finalCommPercent = Number(dealCard.brokeragePercent);
            if (data.agreedPrice && finalCommPercent !== undefined) {
              finalCommAmount = (data.agreedPrice * finalCommPercent) / 100;
            }
          }
        }

        // Block/Reserve the unit immediately
        await tx.unit.update({
          where: { id: data.unitId },
          data: {
            status: 'RESERVED',
            reservedAt: new Date(),
            reservedForId: data.userId,
            ...(finalCommPercent !== undefined ? { commissionPercentage: finalCommPercent } : {})
          }
        });

        await tx.unitStatusHistory.create({
          data: {
            unitId: data.unitId,
            fromStatus: unit.status,
            toStatus: 'RESERVED',
            changedById: data.userId,
            reason: 'Booking initiated'
          }
        });

        // Re-assign data so the booking record gets the updated commission
        data.commissionPercentage = finalCommPercent;
        data.commissionAmount = finalCommAmount;
      } else {
        // Fallback for old frontend code that doesn't pass unitId
        unit = await tx.unit.findFirst({ where: { status: 'AVAILABLE' } });
        if (!unit) {
          unit = await tx.unit.findFirst(); // just grab any if no available (testing fallback)
        }
      }

      const booking = await tx.booking.create({
        data: {
          bookingNumber: `BKG-${Date.now()}`,
          customerId: customer.id,
          unitId: unit?.id,
          source: 'DIRECT',
          salesExecId: data.userId,
          agreedPrice: data.agreedPrice || 0,
          totalPayable: data.agreedPrice || 0,
          tokenAmount: data.bookingAmount || 0,
          commissionPercentage: data.commissionPercentage,
          commissionAmount: data.commissionAmount,
          status: 'DOCUMENTATION_PENDING',
          cancelReason: data.remarks,
        }
      });

      await tx.note.create({
        data: {
          bookingId: booking.id,
          userId: data.userId,
          content: JSON.stringify({
            unitDescription: data.unitDescription,
            paymentMode: data.paymentMode,
            transactionRef: data.transactionRef,
            loanRequired: data.loanRequired,
            remarks: data.remarks
          })
        }
      });

      return booking;
    });

    // ──────────────────────────────────────────────
    // NOTIFICATIONS
    // ──────────────────────────────────────────────
    try {
      // 1. Fetch relevant data for notifications
      const fullBooking = await this.prisma.booking.findUnique({
        where: { id: result.id },
        include: {
          customer: true,
          unit: { include: { floor: { include: { tower: { include: { project: true } } } } } },
          salesExec: true
        }
      });

      if (fullBooking) {
        const projectName = fullBooking.unit?.floor?.tower?.project?.name || 'Project';
        const unitNumber = fullBooking.unit?.unitNumber || 'Unit';

        // Notification #9: Post-Sales Pool
        const postSalesUsers = await this.prisma.user.findMany({
          where: { role: { code: { in: ['POST_SALES', 'CLOSING_MANAGER'] } }, status: 'ACTIVE' },
          select: { id: true }
        });

        for (const u of postSalesUsers) {
          await this.notificationsService.createNotification({
            userId: u.id,
            type: NotificationType.BOOKING_CONFIRMED,
            title: "New booking assigned to you.",
            body: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''} — ${projectName} — ${unitNumber}`,
            actionUrl: `/dashboard/post-sales/lead-management`,
            metadata: {
              bookingId: fullBooking.id,
              leadId: leadId,
              customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''}`,
              projectName,
              unit: unitNumber
            }
          });
        }

        // Notification #13: Recognition (Sales Exec)
        if (data.userId) {
          await this.notificationsService.createNotification({
            userId: data.userId,
            type: NotificationType.RECOGNITION,
            title: "🎉 Congratulations! You closed a booking.",
            body: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''} — ${projectName} Unit ${unitNumber}`,
            actionUrl: `/dashboard/sales-executive/booking`,
            metadata: {
              achievementType: "BOOKING",
              bookingId: fullBooking.id,
              customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''}`,
              projectName,
              unit: unitNumber
            }
          });
        }

        // Notification #13: Recognition (Sourcing Manager)
        if (lead.brokerId) {
          const broker = await this.prisma.broker.findUnique({ where: { id: lead.brokerId } });
          if (broker && broker.sourcingManagerId) {
            await this.notificationsService.createNotification({
              userId: broker.sourcingManagerId,
              type: NotificationType.RECOGNITION,
              title: "🎉 Congratulations! You completed a deal.",
              body: `Broker ${broker.name} brought a booking for ${projectName}.`,
              actionUrl: `/dashboard/sourcing-manager`,
              metadata: {
                achievementType: "BOOKING",
                bookingId: fullBooking.id,
                customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''}`,
                projectName,
                unit: unitNumber
              }
            });
          }
        }

        // Notification #19: Booking Count Milestone Achievement
        const bookingMilestones = [10, 25, 50, 100, 150, 200, 250];

        const checkBookingMilestone = async (userId: string, roleCode: string) => {
          let count = 0;
          if (roleCode === 'SALES_EXECUTIVE') {
            count = await this.prisma.booking.count({ where: { salesExecId: userId } });
          } else if (roleCode === 'SOURCING_MANAGER') {
            // Sourcing manager count: bookings from leads brought by their managed brokers
            count = await this.prisma.booking.count({
              where: {
                customer: {
                  lead: {
                    broker: {
                      sourcingManagerId: userId
                    }
                  }
                }
              }
            });
          }

          if (bookingMilestones.includes(count)) {
            // Deduplication
            const existingNotifs = await this.prisma.notification.findMany({
              where: { userId, type: 'ACHIEVEMENT_MILESTONE' },
              orderBy: { createdAt: 'desc' },
              take: 50
            });
            const alreadySent = existingNotifs.some(n => {
              const meta = n.metadata as any;
              return meta?.achievementType === 'BOOKINGS' && meta?.milestone === count;
            });

            if (!alreadySent) {
              await this.notificationsService.createNotification({
                userId,
                type: NotificationType.ACHIEVEMENT_MILESTONE,
                title: `🎉 Congratulations! You completed ${count} bookings.`,
                body: `You just hit the ${count} bookings milestone. Keep it up!`,
                actionUrl: `/dashboard/${roleCode.toLowerCase().replace('_', '-')}/analytics`,
                metadata: {
                  achievementType: "BOOKINGS",
                  milestone: count,
                  currentCount: count
                }
              });
            }
          }
        };

        if (data.userId) {
          await checkBookingMilestone(data.userId, 'SALES_EXECUTIVE');
        }

        if (lead.brokerId) {
          const brokerForMilestone = await this.prisma.broker.findUnique({ where: { id: lead.brokerId } });
          if (brokerForMilestone && brokerForMilestone.sourcingManagerId) {
            await checkBookingMilestone(brokerForMilestone.sourcingManagerId, 'SOURCING_MANAGER');
          }
        }

        // Notification #14: Inventory Milestone
        const projectId = fullBooking.unit?.floor?.tower?.projectId;
        if (projectId) {
          const project = await this.prisma.project.findUnique({ where: { id: projectId } });
          if (project) {
            const soldUnitsCount = await this.prisma.unit.count({
              where: {
                floor: { tower: { projectId } },
                status: { in: ['SOLD', 'RESERVED'] }
              }
            });
            const totalUnitsCount = await this.prisma.unit.count({
              where: { floor: { tower: { projectId } } }
            });
            const isSoldOut = soldUnitsCount === totalUnitsCount && totalUnitsCount > 0;

            if ([10, 20, 30, 50, 100].includes(soldUnitsCount) || isSoldOut) {
              // Deduplication
              const recentNotifs = await this.prisma.notification.findMany({
                where: { type: 'INVENTORY_MILESTONE' },
                orderBy: { createdAt: 'desc' },
                take: 200
              });
              const alreadySent = recentNotifs.some(n => {
                const meta = n.metadata as any;
                return meta?.projectId === projectId && meta?.milestone === soldUnitsCount;
              });

              if (!alreadySent) {
                let title = `🔥 Milestone Unlocked: ${soldUnitsCount} units sold!`;
                let body = `${project.name} just crossed ${soldUnitsCount} bookings. Let's keep the momentum going!`;
                if (isSoldOut) {
                  title = `🎉 🏆 ${project.name} is SOLD OUT! All ${totalUnitsCount} units sold. Congratulations!`;
                  body = `Great job team!`;
                }

                const userIdsToNotify = new Set<string>();

                if (project.isCpProject) {
                  const assignments = await this.prisma.projectAssignment.findMany({
                    where: { projectId, isActive: true },
                    include: { user: { select: { role: { select: { code: true } } } } }
                  });
                  for (const a of assignments) {
                    if (['SOURCING_MANAGER', 'CLOSING_MANAGER', 'CHANNEL_PARTNER'].includes(a.user.role?.code || '')) {
                      userIdsToNotify.add(a.userId);
                    }
                  }
                } else {
                  const assignments = await this.prisma.projectAssignment.findMany({
                    where: { projectId, isActive: true },
                    include: { user: { select: { role: { select: { code: true } } } } }
                  });
                  for (const a of assignments) {
                    if (['SALES_EXECUTIVE', 'POST_SALES'].includes(a.user.role?.code || '')) {
                      userIdsToNotify.add(a.userId);
                    }
                  }
                }

                for (const uid of userIdsToNotify) {
                  await this.notificationsService.createNotification({
                    userId: uid,
                    type: NotificationType.INVENTORY_MILESTONE,
                    title,
                    body,
                    actionUrl: project.isCpProject ? `/dashboard/closing-manager/inventory/index` : `/dashboard/sales-executive/inventory/index`,
                    metadata: {
                      projectId,
                      projectName: project.name,
                      milestone: soldUnitsCount,
                      totalUnits: totalUnitsCount,
                      isSoldOut
                    }
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to send booking notifications", err);
    }

    return result;
  }
}
