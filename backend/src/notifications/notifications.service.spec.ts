import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../lib/database/prisma-client.js', () => ({
  prismaClient: {
    notification: { findMany: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
    followUp: { count: jest.fn() },
    callRecord: { findMany: jest.fn(), findFirst: jest.fn() },
    lead: { findUnique: jest.fn() },
    managerTaskUser: { findFirst: jest.fn() },
    siteVisit: { count: jest.fn() },
  }
}));

jest.mock('expo-server-sdk', () => ({
  Expo: class {
    chunkPushNotifications = jest.fn().mockReturnValue([[]]);
    sendPushNotificationsAsync = jest.fn();
    static isExpoPushToken = jest.fn().mockReturnValue(true);
  }
}));

import { NotificationsService } from './notifications.service.js';
import { NotificationsGateway } from './notifications.gateway.js';
import { prismaClient } from '../lib/database/prisma-client.js';

describe('NotificationsService', () => {
  let service: NotificationsService;
  
  const mockGateway = {
    sendNotificationToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get user notifications', async () => {
    (prismaClient.notification.findMany as jest.Mock).mockResolvedValue([{ id: 'n-1' }]);
    const res = await service.getUserNotifications('u-1');
    expect(res.length).toBe(1);
  });

  it('should mark as read', async () => {
    (prismaClient.notification.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const res = await service.markAsRead('n-1', 'u-1');
    expect(res.count).toBe(1);
  });

  it('should create notification', async () => {
    (prismaClient.notification.create as jest.Mock).mockResolvedValue({ id: 'n-1' });
    (prismaClient.user.findUnique as jest.Mock).mockResolvedValue({ expoPushToken: 'ExponentPushToken[123]' });
    
    const res = await service.createNotification({ userId: 'u-1', type: 'TEST', title: 'Title' });
    expect(res.id).toBe('n-1');
    expect(mockGateway.sendNotificationToUser).toHaveBeenCalled();
  });
});
