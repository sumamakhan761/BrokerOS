import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { BookingStatusService } from '../leads/bookings/booking-status.service.js';
import { NotificationType, ApprovalType } from '@brokeros/prisma';
import {
  CreateApprovalRequestDto,
  AddApprovalMessageDto,
} from './dto/approvals.dto.js';
import { processBookingApprovalMilestones } from './services/approvals-milestone.helper.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private bookingStatusService: BookingStatusService,
  ) {}

  async createRequest(salesExecId: string, dto: CreateApprovalRequestDto) {
    // Get the SE's manager
    const se = await this.prisma.user.findUnique({
      where: { id: salesExecId },
      select: { managerId: true },
    });

    if (!se || !se.managerId) {
      throw new BadRequestException(
        'Sales Executive does not have an assigned manager.',
      );
    }

    let finalDescription = dto.description;
    let finalMetadata: any = undefined;

    if (dto.type === 'BOOKING' && dto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
        include: {
          customer: true,
          unit: {
            include: {
              floor: {
                include: {
                  tower: {
                    include: { project: true },
                  },
                },
              },
            },
          },
          documents: true,
          loanCase: true,
        },
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
            documents: booking.documents.map((doc) => ({
              name: doc.title || doc.type || 'Document',
              url: doc.fileUrl,
            })),
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
        type: dto.type || 'DISCOUNT',
        bookingId: dto.bookingId,
        messages: {
          create: {
            senderId: salesExecId,
            title: dto.title,
            description: finalDescription,
            fileUrl: dto.fileUrl,
            metadata: finalMetadata ? finalMetadata : undefined,
          },
        },
      },
      include: {
        messages: true,
        salesExec: { select: { name: true } },
      },
    });

    const preview =
      dto.description.length > 100
        ? dto.description.substring(0, 100) + '...'
        : dto.description;
    await this.notificationsService.createNotification({
      userId: se.managerId,
      type: NotificationType.BOOKING_REQUEST,
      title: `New approval request from ${request.salesExec?.name || 'an employee'}.`,
      body: preview,
      actionUrl: `/dashboard/sales-manager/approval`,
      metadata: {
        approvalId: request.id,
        type: dto.type || 'DISCOUNT',
        bookingId: dto.bookingId,
        fromEmployeeName: request.salesExec?.name,
      },
    });

    return request;
  }

  async getRequests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    const roleCode = user?.role?.code;

    if (roleCode === 'SALES_MANAGER') {
      return this.prisma.approvalRequest.findMany({
        where: { managerId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          salesExec: { select: { id: true, name: true, username: true } },
          messages: {
            take: 1, // Get the latest message for preview
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } else if (roleCode === 'SALES_EXECUTIVE') {
      return this.prisma.approvalRequest.findMany({
        where: { salesExecId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          manager: { select: { id: true, name: true, username: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
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
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                role: { select: { code: true } },
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Approval request not found');
    }

    return request;
  }

  async addMessage(
    requestId: string,
    userId: string,
    data: AddApprovalMessageDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    const roleCode = user?.role?.code;

    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });
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
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                role: { select: { code: true } },
              },
            },
          },
        },
        manager: { select: { name: true } },
        salesExec: { select: { name: true } },
      },
    });

    if (
      newStatus === 'APPROVED' &&
      request.type === 'BOOKING' &&
      request.bookingId
    ) {
      await this.bookingStatusService.markBookingDone(request.bookingId);
      // Trigger Congratulatory Notification
      await this.notificationsService.createNotification({
        userId: request.salesExecId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: 'Congratulations! 🎉',
        body: `Your booking request has been approved and confirmed by ${updated.manager?.name}.`,
        actionUrl: `/dashboard/sales-executive/booking/${request.bookingId}`,
        metadata: { bookingId: request.bookingId },
      });

      // Trigger Booking Milestones & Recognition
      try {
        await processBookingApprovalMilestones(
          request.bookingId,
          request.salesExecId,
          this.prisma,
          this.notificationsService,
        );
      } catch (err) {
        console.error('Failed to send booking milestone notifications', err);
      }
    }

    if (roleCode === 'SALES_MANAGER') {
      let type: NotificationType = NotificationType.CHAT_MESSAGE;
      let title = 'New message on your request.';

      if (data.action === 'APPROVE') {
        type = NotificationType.REQUEST_APPROVED;
        title = 'Your approval request was approved! ✅';
      } else if (data.action === 'REJECT') {
        type = NotificationType.REQUEST_REJECTED;
        title = 'Your approval request was rejected.';
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
        },
      });
    } else if (roleCode === 'SALES_EXECUTIVE') {
      await this.notificationsService.createNotification({
        userId: request.managerId,
        type: NotificationType.CHAT_MESSAGE,
        title: 'New response on approval request',
        body: `${updated.salesExec?.name || 'An employee'} replied to their approval request.`,
        actionUrl: `/dashboard/sales-manager/approval`,
        metadata: {
          approvalId: request.id,
          status: newStatus,
          employeeName: updated.salesExec?.name,
        },
      });
    }

    return updated;
  }

  async closeRequest(requestId: string) {
    return this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: 'CLOSED' },
    });
  }

  async redoRequestDecision(requestId: string, managerId: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Approval request not found');
    }
    if (request.managerId !== managerId) {
      throw new BadRequestException(
        'Only the assigned manager can redo this request',
      );
    }
    if (request.redoCount >= 2) {
      throw new BadRequestException(
        'Redo limit reached for this request (Max 2)',
      );
    }
    if (request.status !== 'APPROVED' && request.status !== 'REJECTED') {
      throw new BadRequestException(
        'Request is not in a completed state to redo',
      );
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'REQUESTED',
        redoCount: { increment: 1 },
      },
    });

    // If it was a BOOKING that was approved, we should un-confirm it
    if (
      request.type === 'BOOKING' &&
      request.bookingId &&
      request.status === 'APPROVED'
    ) {
      await this.prisma.booking.update({
        where: { id: request.bookingId },
        data: { status: 'DOCUMENTATION_PENDING' }, // Revert to previous logical state
      });
    }

    // Send notification to Sales Exec about the redo
    await this.notificationsService.createNotification({
      userId: request.salesExecId,
      type: NotificationType.CHAT_MESSAGE,
      title: 'Approval Decision Undone',
      body: 'Your manager has undone their decision on your request. It is now pending again.',
      actionUrl: `/dashboard/sales-executive/approval`,
      metadata: { approvalId: request.id },
    });

    return updated;
  }
}
