import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType, ApprovalType } from '../generated/prisma/client.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async createRequest(salesExecId: string, title: string, description: string, fileUrl?: string, type: ApprovalType = 'DISCOUNT', bookingId?: string) {
    // Get the SE's manager
    const se = await this.prisma.user.findUnique({
      where: { id: salesExecId },
      select: { managerId: true },
    });

    if (!se || !se.managerId) {
      throw new BadRequestException('Sales Executive does not have an assigned manager.');
    }

    let finalDescription = description;
    let finalMetadata: any = undefined;

    if (type === 'BOOKING' && bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          unit: {
            include: {
              floor: {
                include: {
                  tower: {
                    include: { project: true }
                  }
                }
              }
            }
          },
          documents: true,
          loanCase: true,
        }
      });

      if (booking) {
        finalDescription = `Booking Details
Lead Name: ${booking.customer.firstName} ${booking.customer.lastName || ''}
Project: ${booking.unit.floor.tower.project.name}
Tower / Floor / Unit: ${booking.unit.floor.tower.name} / ${booking.unit.floor.floorNumber} / ${booking.unit.unitNumber}
Agreed Price: ₹${booking.agreedPrice.toString()}
Booking Amount: ₹${booking.tokenAmount?.toString() || booking.totalPayable.toString()}
Loan Required: ${booking.loanCase ? 'Yes' : 'No'}
Remarks: System generated booking request.`;

        if (booking.documents && booking.documents.length > 0) {
          finalMetadata = {
            documents: booking.documents.map(doc => ({
              name: doc.title || doc.type || 'Document',
              url: doc.fileUrl
            }))
          };
        }
      }
    }

    // Create Request and Initial Message
    const request = await this.prisma.approvalRequest.create({
      data: {
        salesExecId,
        managerId: se.managerId,
        status: 'REQUESTED',
        type,
        bookingId,
        messages: {
          create: {
            senderId: salesExecId,
            title,
            description: finalDescription,
            fileUrl,
            metadata: finalMetadata ? finalMetadata : undefined,
          },
        },
      },
      include: {
        messages: true,
        salesExec: { select: { name: true } },
      }
    });

    const preview = description.length > 100 ? description.substring(0, 100) + '...' : description;
    await this.notificationsService.createNotification({
      userId: se.managerId,
      type: NotificationType.BOOKING_REQUEST,
      title: `New approval request from ${request.salesExec?.name || 'an employee'}.`,
      body: preview,
      actionUrl: `/dashboard/sales-manager/approval`,
      metadata: {
        approvalId: request.id,
        type,
        bookingId,
        fromEmployeeName: request.salesExec?.name,
      }
    });

    return request;
  }

  async getRequests(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const roleCode = user?.role?.code;

    if (roleCode === 'SALES_MANAGER') {
      return this.prisma.approvalRequest.findMany({
        where: { managerId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          salesExec: { select: { id: true, name: true, username: true } },
          messages: {
            take: 1, // Get the latest message for preview
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else if (roleCode === 'SALES_EXECUTIVE') {
      return this.prisma.approvalRequest.findMany({
        where: { salesExecId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          manager: { select: { id: true, name: true, username: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    return [];
  }

  async getRequestDetails(id: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        salesExec: { select: { id: true, name: true, username: true } },
        manager: { select: { id: true, name: true, username: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, username: true, role: { select: { code: true } } } },
          }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Approval request not found');
    }

    return request;
  }

  async addMessage(
    requestId: string,
    userId: string,
    data: { title: string; description: string; fileUrl?: string; action?: 'APPROVE' | 'REJECT' | 'REPLY' }
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const roleCode = user?.role?.code;

    const request = await this.prisma.approvalRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Approval request not found');
    }

    if (request.status === 'CLOSED') {
      throw new BadRequestException('Cannot reply to a closed request');
    }

    let newStatus: any = request.status;

    if (roleCode === 'SALES_MANAGER' && data.action === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (roleCode === 'SALES_MANAGER' && data.action === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (roleCode === 'SALES_EXECUTIVE') {
      newStatus = 'REQUESTED'; // SE pushing back
    }

    // Update status and add message
    const updated = await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        messages: {
          create: {
            senderId: userId,
            title: data.title,
            description: data.description,
            fileUrl: data.fileUrl,
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, username: true, role: { select: { code: true } } } },
          }
        },
        manager: { select: { name: true } },
        salesExec: { select: { name: true } },
      }
    });

    if (newStatus === 'APPROVED' && request.type === 'BOOKING' && request.bookingId) {
      await this.prisma.booking.update({
        where: { id: request.bookingId },
        data: { status: 'CONFIRMED' }
      });
      // Trigger Congratulatory Notification
      await this.notificationsService.createNotification({
        userId: request.salesExecId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: 'Congratulations! 🎉',
        body: `Your booking request has been approved and confirmed by ${updated.manager?.name}.`,
        actionUrl: `/dashboard/sales-executive/booking/${request.bookingId}`,
        metadata: { bookingId: request.bookingId }
      });

      // ──────────────────────────────────────────────
      // BOOKING NOTIFICATIONS (Milestones & Recognition)
      // ──────────────────────────────────────────────
      try {
        const fullBooking = await this.prisma.booking.findUnique({
          where: { id: request.bookingId },
          include: {
            customer: { include: { lead: true } },
            unit: { include: { floor: { include: { tower: { include: { project: true } } } } } },
            salesExec: true
          }
        });

        if (fullBooking) {
          const projectName = fullBooking.unit?.floor?.tower?.project?.name || 'Project';
          const unitNumber = fullBooking.unit?.unitNumber || 'Unit';
          const lead = fullBooking.customer.lead;

          // Notification #13: Recognition (Sales Exec)
          await this.notificationsService.createNotification({
            userId: request.salesExecId,
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

          // Notification #13: Recognition (Sourcing Manager)
          if (lead?.brokerId) {
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
              count = await this.prisma.booking.count({ where: { salesExecId: userId, status: 'CONFIRMED' } });
            } else if (roleCode === 'SOURCING_MANAGER') {
              count = await this.prisma.booking.count({
                where: {
                  status: 'CONFIRMED',
                  customer: { lead: { broker: { sourcingManagerId: userId } } }
                }
              });
            }

            if (bookingMilestones.includes(count)) {
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
                  metadata: { achievementType: "BOOKINGS", milestone: count, currentCount: count }
                });
              }
            }
          };

          await checkBookingMilestone(request.salesExecId, 'SALES_EXECUTIVE');

          if (lead?.brokerId) {
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
                  status: { in: ['SOLD'] } // Since it's confirmed, unit should be SOLD (we need to update unit to SOLD too?)
                }
              });
              const totalUnitsCount = await this.prisma.unit.count({
                where: { floor: { tower: { projectId } } }
              });
              const isSoldOut = soldUnitsCount === totalUnitsCount && totalUnitsCount > 0;

              if ([10, 20, 30, 50, 100].includes(soldUnitsCount) || isSoldOut) {
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
                  const assignments = await this.prisma.projectAssignment.findMany({
                    where: { projectId, isActive: true },
                    include: { user: { select: { role: { select: { code: true } } } } }
                  });

                  for (const a of assignments) {
                    const roleCode = a.user.role?.code || '';
                    if (project.isCpProject && ['SOURCING_MANAGER', 'CLOSING_MANAGER', 'CHANNEL_PARTNER'].includes(roleCode)) {
                      userIdsToNotify.add(a.userId);
                    } else if (!project.isCpProject && ['SALES_EXECUTIVE', 'POST_SALES'].includes(roleCode)) {
                      userIdsToNotify.add(a.userId);
                    }
                  }

                  for (const uid of userIdsToNotify) {
                    await this.notificationsService.createNotification({
                      userId: uid,
                      type: NotificationType.INVENTORY_MILESTONE,
                      title,
                      body,
                      actionUrl: project.isCpProject ? `/dashboard/closing-manager/inventory/index` : `/dashboard/sales-executive/inventory/index`,
                      metadata: { projectId, projectName: project.name, milestone: soldUnitsCount, totalUnits: totalUnitsCount, isSoldOut }
                    });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to send booking milestone notifications", err);
      }
    }

    if (roleCode === 'SALES_MANAGER') {
      let type: NotificationType = NotificationType.CHAT_MESSAGE;
      let title = "New message on your request.";

      if (data.action === 'APPROVE') {
        type = NotificationType.REQUEST_APPROVED;
        title = "Your approval request was approved! ✅";
      } else if (data.action === 'REJECT') {
        type = NotificationType.REQUEST_REJECTED;
        title = "Your approval request was rejected.";
      }

      await this.notificationsService.createNotification({
        userId: request.salesExecId,
        type: type,
        title: title,
        body: `${updated.manager?.name || 'Your manager'} responded to your request.`,
        actionUrl: `/dashboard/sales-executive/approval`,
        metadata: {
          approvalId: request.id,
          status: newStatus,
          managerName: updated.manager?.name,
        }
      });
    } else if (roleCode === 'SALES_EXECUTIVE') {
      await this.notificationsService.createNotification({
        userId: request.managerId,
        type: NotificationType.CHAT_MESSAGE,
        title: "New response on approval request",
        body: `${updated.salesExec?.name || 'An employee'} replied to their approval request.`,
        actionUrl: `/dashboard/sales-manager/approval`,
        metadata: {
          approvalId: request.id,
          status: newStatus,
          employeeName: updated.salesExec?.name,
        }
      });
    }

    return updated;
  }

  async closeRequest(requestId: string) {
    return this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: 'CLOSED' }
    });
  }

  async redoRequestDecision(requestId: string, managerId: string) {
    const request = await this.prisma.approvalRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Approval request not found');
    }
    if (request.managerId !== managerId) {
      throw new BadRequestException('Only the assigned manager can redo this request');
    }
    if (request.redoCount >= 2) {
      throw new BadRequestException('Redo limit reached for this request (Max 2)');
    }
    if (request.status !== 'APPROVED' && request.status !== 'REJECTED') {
      throw new BadRequestException('Request is not in a completed state to redo');
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'REQUESTED',
        redoCount: { increment: 1 },
      }
    });

    // If it was a BOOKING that was approved, we should un-confirm it
    if (request.type === 'BOOKING' && request.bookingId && request.status === 'APPROVED') {
      await this.prisma.booking.update({
        where: { id: request.bookingId },
        data: { status: 'DOCUMENTATION_PENDING' } // Revert to previous logical state
      });
    }

    // Send notification to Sales Exec about the redo
    await this.notificationsService.createNotification({
      userId: request.salesExecId,
      type: NotificationType.CHAT_MESSAGE,
      title: 'Approval Decision Undone',
      body: 'Your manager has undone their decision on your request. It is now pending again.',
      actionUrl: `/dashboard/sales-executive/approval`,
      metadata: { approvalId: request.id }
    });

    return updated;
  }
}

