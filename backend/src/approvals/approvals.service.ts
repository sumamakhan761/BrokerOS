import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../generated/prisma/client.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async createRequest(salesExecId: string, title: string, description: string, fileUrl?: string) {
    // Get the SE's manager
    const se = await this.prisma.user.findUnique({
      where: { id: salesExecId },
      select: { managerId: true },
    });

    if (!se || !se.managerId) {
      throw new BadRequestException('Sales Executive does not have an assigned manager.');
    }

    // Create Request and Initial Message
    const request = await this.prisma.approvalRequest.create({
      data: {
        salesExecId,
        managerId: se.managerId,
        status: 'REQUESTED',
        messages: {
          create: {
            senderId: salesExecId,
            title,
            description,
            fileUrl,
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
        type: 'DISCOUNT',
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
      newStatus = 'CLOSED'; // Marking as closed if rejected to be clear, though previously it stayed REQUESTED
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
}
