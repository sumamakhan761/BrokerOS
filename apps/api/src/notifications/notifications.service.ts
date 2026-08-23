import { Injectable, Logger } from '@nestjs/common';
import { prismaClient as prisma } from '../lib/database/prisma-client.js';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { NotificationsGateway } from './notifications.gateway.js';
import { NotificationType } from '@brokeros/prisma';
import { CreateNotificationDto } from './dto/notifications.dto.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo = new Expo();

  constructor(private readonly gateway: NotificationsGateway) { }

  async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Creates a notification, emits it via WebSocket, and sends an Expo push notification.
   */
  async createNotification(params: CreateNotificationDto) {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        entityType: params.entityType,
        entityId: params.entityId,
        actionUrl: params.actionUrl,
        metadata: params.metadata || {},
      },
    });

    // 2. Emit WebSocket event to instantly update the bell icon (unless skipped)
    if (!params.skipWebSocket) {
      this.gateway.sendNotificationToUser(params.userId, notification);
    }

    // 3. Send Native Push Notification
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { expoPushToken: true },
    });

    if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
      const messages: ExpoPushMessage[] = [
        {
          to: user.expoPushToken,
          sound: 'default',
          title: params.title,
          body: params.body,
          categoryId: params.categoryId,
          data: { actionUrl: params.actionUrl, entityId: params.entityId, ...params.metadata },
        },
      ];

      try {
        const chunks = this.expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
          await this.expo.sendPushNotificationsAsync(chunk);
        }
      } catch (error) {
        this.logger.error('Failed to send Expo push notification', error);
      }
    }

    return notification;
  }

  async checkDailyTaskCompletion(userId: string, taskType?: 'CALLS' | 'FOLLOW_UPS' | 'SITE_VISITS') {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, expoPushToken: true } });
    if (!user || !user.role || !user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) return;

    const role = user.role.code;
    if (role !== 'PRE_SALES' && role !== 'SALES_EXECUTIVE') return;

    const followUpsDone = await prisma.followUp.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: start, lt: end } } });
    const followUpsTarget = await prisma.followUp.count({ where: { userId, scheduledDate: { gte: start, lt: end } } });

    let progressString = '';

    if (role === 'PRE_SALES') {
      const todayCallRecords = await prisma.callRecord.findMany({
        where: { userId, startedAt: { gte: start, lt: end }, leadId: { not: null } },
        select: { leadId: true }
      });
      let coldCallCount = 0;
      for (const record of todayCallRecords) {
        if (!record.leadId) continue;
        const earlierCall = await prisma.callRecord.findFirst({
          where: { userId, leadId: record.leadId, startedAt: { lt: start } },
          select: { id: true }
        });
        if (!earlierCall) {
          const lead = await prisma.lead.findUnique({ where: { id: record.leadId }, select: { status: true } });
          if (lead && (lead.status === 'NEW' || lead.status === 'CONTACTED')) coldCallCount++;
        }
      }

      const assignment = await prisma.managerTaskUser.findFirst({
        where: { userId, task: { isActive: true } },
        include: { task: true },
        orderBy: { createdAt: 'desc' }
      });
      const callsTarget = assignment?.targetOverride ?? assignment?.task?.coldCallTarget ?? 100;
      progressString = `${coldCallCount} / ${callsTarget} Calls, ${followUpsDone} / ${followUpsTarget} Follow-ups`;
    } else if (role === 'SALES_EXECUTIVE') {
      const siteVisitsDone = await prisma.siteVisit.count({ where: { salesExecId: userId, status: 'COMPLETED', completedAt: { gte: start, lt: end } } });
      const siteVisitsTarget = await prisma.siteVisit.count({ where: { salesExecId: userId, scheduledDate: { gte: start, lt: end } } });
      progressString = `${siteVisitsDone} / ${siteVisitsTarget} Site Visits, ${followUpsDone} / ${followUpsTarget} Follow-ups`;
    }

    try {
      await this.expo.sendPushNotificationsAsync([{
        to: user.expoPushToken,
        _contentAvailable: true,
        data: {
          type: 'DAILY_PROGRESS',
          progressString
        }
      }]);
    } catch (err) {
      this.logger.error('Failed to send silent data push for daily progress', err);
    }
  }
}
