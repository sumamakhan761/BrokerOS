import { Test, TestingModule } from '@nestjs/testing';
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {
    MISSED_FOLLOW_UP: 'MISSED_FOLLOW_UP',
    MANAGER_TEAM_ALERT: 'MANAGER_TEAM_ALERT',
    SITE_VISIT_REMINDER: 'SITE_VISIT_REMINDER',
    SITE_VISIT_ARRIVE: 'SITE_VISIT_ARRIVE',
    MONTHLY_ANALYTICS: 'MONTHLY_ANALYTICS',
    MONTHLY_LEADERBOARD: 'MONTHLY_LEADERBOARD',
  },
}));
jest.mock('../lib/database/prisma-client.js', () => ({
  prismaClient: {
    followUp: { findMany: jest.fn(), count: jest.fn() },
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    siteVisit: { findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
    booking: { count: jest.fn() },
    possessionHandover: { count: jest.fn() },
    broker: { findMany: jest.fn() },
  },
}));

import { NotificationsCron } from './notifications.cron.js';
import { NotificationsService } from './notifications.service.js';
import { SchedulerRegistry } from '@nestjs/schedule';
import { prismaClient } from '../lib/database/prisma-client.js';

describe('NotificationsCron', () => {
  let cron: NotificationsCron;

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockSchedulerRegistry = {
    doesExist: jest.fn().mockReturnValue(false),
    addTimeout: jest.fn(),
    deleteTimeout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsCron,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
      ],
    }).compile();
    cron = module.get(NotificationsCron);
  });

  afterEach(() => jest.clearAllMocks());

  it('should run handleMissedFollowUps', async () => {
    (prismaClient.followUp.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'f-1',
        userId: 'u-1',
        status: 'SCHEDULED',
        user: { managerId: 'm-1', role: { code: 'PRE_SALES' } },
      },
    ]);
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue({
      role: { code: 'PRE_SALES_MANAGER' },
    });

    await cron.handleMissedFollowUps();
    expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should run handleTomorrowSiteVisits', async () => {
    (prismaClient.siteVisit.findMany as jest.Mock).mockResolvedValue([
      {
        id: 's-1',
        salesExecId: 'u-1',
        scheduledDate: new Date(),
        lead: { firstName: 'Test' },
      },
    ]);
    await cron.handleTomorrowSiteVisits();
    expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should run scheduleTodaySiteVisitArrivePush', async () => {
    (prismaClient.siteVisit.findMany as jest.Mock).mockResolvedValue([
      {
        id: 's-1',
        salesExecId: 'u-1',
        scheduledDate: new Date(Date.now() + 10 * 60000),
        lead: { firstName: 'Test' },
        project: { name: 'Proj' },
      },
    ]);
    await cron.scheduleTodaySiteVisitArrivePush();
    expect(mockSchedulerRegistry.addTimeout).toHaveBeenCalled();
  });

  it('should run sendMonthlyAnalyticsReports', async () => {
    (prismaClient.user.findMany as jest.Mock).mockResolvedValue([
      { id: 'u-1', role: { code: 'PRE_SALES' } },
    ]);
    await cron.sendMonthlyAnalyticsReports();
    expect(mockNotificationsService.createNotification).toHaveBeenCalled();
  });
});
