import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class { }
}));
jest.mock('expo-server-sdk', () => ({ Expo: class { } }));

import { FollowUpsService } from './follow-ups.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto.js';
import { FollowUpStatus } from '@brokeros/prisma';

jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

describe('FollowUpsService', () => {
  let service: FollowUpsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    lead: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    followUp: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationsService = {
    checkDailyTaskCompletion: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUpsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<FollowUpsService>(FollowUpsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFollowUps', () => {
    it('should throw an error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(service.getFollowUps('invalid-lead')).rejects.toThrow('Lead not found');
    });

    it('should return follow-ups for a valid lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      mockPrismaService.followUp.findMany.mockResolvedValue([{ id: 'f-1' }]);
      const result = await service.getFollowUps('lead-1');
      expect(result).toEqual([{ id: 'f-1' }]);
      expect(mockPrismaService.followUp.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-1' },
        orderBy: { scheduledDate: 'desc' },
        include: {
          user: { select: { username: true, email: true, displayUsername: true } },
        },
      });
    });
  });

  describe('createFollowUp', () => {
    it('should throw an error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(
        service.createFollowUp('invalid-lead', { userId: 'u-1', scheduledDate: '2026-01-01' } as CreateFollowUpDto)
      ).rejects.toThrow('Lead not found');
    });

    it('should create a follow-up and update lead nextFollowUpDate', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      mockPrismaService.followUp.create.mockResolvedValue({ id: 'f-1' });

      const result = await service.createFollowUp('lead-1', {
        userId: 'u-1',
        scheduledDate: '2026-01-01T00:00:00.000Z',
        type: 'CALL',
        remarks: 'Test remark',
      } as CreateFollowUpDto);

      expect(mockPrismaService.followUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            leadId: 'lead-1',
            userId: 'u-1',
            type: 'CALL',
            remarks: 'Test remark',
            status: 'SCHEDULED',
            scheduledDate: new Date('2026-01-01T00:00:00.000Z'),
          }),
        })
      );
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: { nextFollowUpDate: new Date('2026-01-01T00:00:00.000Z') },
      });
      expect(result).toEqual({ id: 'f-1' });
    });
  });

  describe('updateFollowUp', () => {
    it('should update a follow-up', async () => {
      mockPrismaService.followUp.update.mockResolvedValue({ id: 'f-1', userId: 'u-1' });
      const result = await service.updateFollowUp('f-1', { remarks: 'New remark' } as UpdateFollowUpDto);
      expect(result).toEqual({ id: 'f-1', userId: 'u-1' });
      expect(mockPrismaService.followUp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'f-1' },
          data: expect.objectContaining({ remarks: 'New remark' }),
        })
      );
      expect(mockNotificationsService.checkDailyTaskCompletion).not.toHaveBeenCalled();
    });

    it('should check daily task completion if status is COMPLETED', async () => {
      mockPrismaService.followUp.update.mockResolvedValue({ id: 'f-1', userId: 'u-1', status: 'COMPLETED' });
      const result = await service.updateFollowUp('f-1', { status: 'COMPLETED' as FollowUpStatus } as UpdateFollowUpDto);
      expect(result).toEqual({ id: 'f-1', userId: 'u-1', status: 'COMPLETED' });
      expect(mockNotificationsService.checkDailyTaskCompletion).toHaveBeenCalledWith('u-1', 'FOLLOW_UPS');
    });
  });

  describe('deleteFollowUp', () => {
    it('should delete a follow-up', async () => {
      mockPrismaService.followUp.delete.mockResolvedValue({ id: 'f-1' });
      const result = await service.deleteFollowUp('f-1');
      expect(result).toEqual({ id: 'f-1' });
      expect(mockPrismaService.followUp.delete).toHaveBeenCalledWith({ where: { id: 'f-1' } });
    });
  });
});
