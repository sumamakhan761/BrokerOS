import { NotificationType } from '@brokeros/prisma';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

export async function processBookingApprovalMilestones(
  bookingId: string,
  salesExecId: string,
  prisma: PrismaService,
  notificationsService: NotificationsService,
): Promise<void> {
  const fullBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { include: { lead: true } },
      unit: {
        include: {
          floor: { include: { tower: { include: { project: true } } } },
        },
      },
      salesExec: true,
    },
  });

  if (!fullBooking) return;

  const projectName =
    fullBooking.unit?.floor?.tower?.project?.name || 'Project';
  const unitNumber = fullBooking.unit?.unitNumber || 'Unit';
  const lead = fullBooking.customer.lead;

  // Notification #13: Recognition (Sales Exec)
  await notificationsService.createNotification({
    userId: salesExecId,
    type: NotificationType.RECOGNITION,
    title: '🎉 Congratulations! You closed a booking.',
    body: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''} — ${projectName} Unit ${unitNumber}`,
    actionUrl: `/dashboard/sales-executive/booking`,
    metadata: {
      achievementType: 'BOOKING',
      bookingId: fullBooking.id,
      customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''}`,
      projectName,
      unit: unitNumber,
    },
  });

  // Notification #13: Recognition (Sourcing Manager)
  if (lead?.brokerId) {
    const broker = await prisma.broker.findUnique({
      where: { id: lead.brokerId },
    });
    if (broker && broker.sourcingManagerId) {
      await notificationsService.createNotification({
        userId: broker.sourcingManagerId,
        type: NotificationType.RECOGNITION,
        title: '🎉 Congratulations! You completed a deal.',
        body: `Broker ${broker.name} brought a booking for ${projectName}.`,
        actionUrl: `/dashboard/sourcing-manager`,
        metadata: {
          achievementType: 'BOOKING',
          bookingId: fullBooking.id,
          customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName || ''}`,
          projectName,
          unit: unitNumber,
        },
      });
    }
  }

  // Notification #19: Booking Count Milestone Achievement
  const bookingMilestones = [10, 25, 50, 100, 150, 200, 250];

  const checkBookingMilestone = async (
    userId: string,
    roleCode: string,
  ) => {
    let count = 0;
    if (roleCode === 'SALES_EXECUTIVE') {
      count = await prisma.booking.count({
        where: { salesExecId: userId, status: 'CONFIRMED' },
      });
    } else if (roleCode === 'SOURCING_MANAGER') {
      count = await prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          customer: { lead: { broker: { sourcingManagerId: userId } } },
        },
      });
    }

    if (bookingMilestones.includes(count)) {
      const existingNotifs = await prisma.notification.findMany({
        where: { userId, type: 'ACHIEVEMENT_MILESTONE' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      const alreadySent = existingNotifs.some((n) => {
        const meta = n.metadata as any;
        return (
          meta?.achievementType === 'BOOKINGS' &&
          meta?.milestone === count
        );
      });

      if (!alreadySent) {
        await notificationsService.createNotification({
          userId,
          type: NotificationType.ACHIEVEMENT_MILESTONE,
          title: `🎉 Congratulations! You completed ${count} bookings.`,
          body: `You just hit the ${count} bookings milestone. Keep it up!`,
          actionUrl: `/dashboard/${roleCode.toLowerCase().replace('_', '-')}/analytics`,
          metadata: {
            achievementType: 'BOOKINGS',
            milestone: count,
            currentCount: count,
          },
        });
      }
    }
  };

  await checkBookingMilestone(salesExecId, 'SALES_EXECUTIVE');

  if (lead?.brokerId) {
    const brokerForMilestone = await prisma.broker.findUnique({
      where: { id: lead.brokerId },
    });
    if (brokerForMilestone && brokerForMilestone.sourcingManagerId) {
      await checkBookingMilestone(
        brokerForMilestone.sourcingManagerId,
        'SOURCING_MANAGER',
      );
    }
  }

  // Notification #14: Inventory Milestone
  const projectId = fullBooking.unit?.floor?.tower?.projectId;
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (project) {
      const soldUnitsCount = await prisma.unit.count({
        where: {
          floor: { tower: { projectId } },
          status: { in: ['SOLD'] },
        },
      });
      const totalUnitsCount = await prisma.unit.count({
        where: { floor: { tower: { projectId } } },
      });
      const isSoldOut =
        soldUnitsCount === totalUnitsCount && totalUnitsCount > 0;

      if ([10, 20, 30, 50, 100].includes(soldUnitsCount) || isSoldOut) {
        const recentNotifs = await prisma.notification.findMany({
          where: { type: 'INVENTORY_MILESTONE' },
          orderBy: { createdAt: 'desc' },
          take: 200,
        });
        const alreadySent = recentNotifs.some((n) => {
          const meta = n.metadata as any;
          return (
            meta?.projectId === projectId &&
            meta?.milestone === soldUnitsCount
          );
        });

        if (!alreadySent) {
          let title = `🔥 Milestone Unlocked: ${soldUnitsCount} units sold!`;
          let body = `${project.name} just crossed ${soldUnitsCount} bookings. Let's keep the momentum going!`;
          if (isSoldOut) {
            title = `🎉 🏆 ${project.name} is SOLD OUT! All ${totalUnitsCount} units sold. Congratulations!`;
            body = `Great job team!`;
          }

          const userIdsToNotify = new Set<string>();
          const assignments = await prisma.projectAssignment.findMany({
            where: { projectId, isActive: true },
            include: {
              user: { select: { role: { select: { code: true } } } },
            },
          });

          for (const a of assignments) {
            const roleCode = a.user.role?.code || '';
            if (
              project.isCpProject &&
              [
                'SOURCING_MANAGER',
                'CLOSING_MANAGER',
                'CHANNEL_PARTNER',
              ].includes(roleCode)
            ) {
              userIdsToNotify.add(a.userId);
            } else if (
              !project.isCpProject &&
              ['SALES_EXECUTIVE', 'POST_SALES'].includes(roleCode)
            ) {
              userIdsToNotify.add(a.userId);
            }
          }

          for (const uid of userIdsToNotify) {
            await notificationsService.createNotification({
              userId: uid,
              type: NotificationType.INVENTORY_MILESTONE,
              title,
              body,
              actionUrl: project.isCpProject
                ? `/dashboard/closing-manager/inventory/index`
                : `/dashboard/sales-executive/inventory/index`,
              metadata: {
                projectId,
                projectName: project.name,
                milestone: soldUnitsCount,
                totalUnits: totalUnitsCount,
                isSoldOut,
              },
            });
          }
        }
      }
    }
  }
}
