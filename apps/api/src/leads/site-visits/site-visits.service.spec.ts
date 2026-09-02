import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { SiteVisitsService } from './site-visits.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import {
  CreateSiteVisitDto,
  UpdateSiteVisitDto,
  ArriveSiteVisitDto,
} from './dto/site-visit.dto.js';
import { SiteVisitStatus } from '@brokeros/prisma';

jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../notifications/notifications.service.js');

describe('SiteVisitsService', () => {
  let service: SiteVisitsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    lead: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    siteVisit: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectAssignment: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
    checkDailyTaskCompletion: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteVisitsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<SiteVisitsService>(SiteVisitsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSiteVisits', () => {
    it('should throw error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(service.getSiteVisits('invalid')).rejects.toThrow(
        'Lead not found',
      );
    });

    it('should return site visits for a lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      mockPrismaService.siteVisit.findMany.mockResolvedValue([{ id: 'sv-1' }]);

      const result = await service.getSiteVisits('lead-1');
      expect(result).toEqual([{ id: 'sv-1' }]);
      expect(mockPrismaService.siteVisit.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-1' },
        orderBy: { scheduledDate: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          createdBy: { select: { username: true, displayUsername: true } },
        },
      });
    });
  });

  describe('createSiteVisit', () => {
    it('should throw error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(
        service.createSiteVisit('lead-1', {
          userId: 'u-1',
          projectId: 'p-1',
          scheduledDate: '2026-01-01',
        }),
      ).rejects.toThrow('Lead not found');

      consoleSpy.mockRestore();
    });

    it('should throw BadRequestException when no project assignments exist', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-1',
        firstName: 'John',
      });
      mockPrismaService.projectAssignment.findMany.mockResolvedValue([]);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(
        service.createSiteVisit('lead-1', {
          userId: 'u-1',
          projectId: 'p-1',
          scheduledDate: '2026-01-01T00:00:00Z',
        }),
      ).rejects.toThrow(
        'No Sales Executives are assigned to this project. Please contact a manager.',
      );

      consoleSpy.mockRestore();
    });

    it('should assign round-robin to next project exec if last SV exists', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-1',
        firstName: 'John',
      });
      mockPrismaService.projectAssignment.findMany.mockResolvedValue([
        { userId: 'exec-1' },
        { userId: 'exec-2' },
      ]);
      mockPrismaService.siteVisit.findFirst.mockResolvedValue({
        salesExecId: 'exec-1',
      });
      mockPrismaService.siteVisit.create.mockResolvedValue({
        id: 'sv-1',
        project: { name: 'ProjA' },
      });

      await service.createSiteVisit('lead-1', {
        userId: 'u-1',
        projectId: 'p-1',
        scheduledDate: '2026-01-01T00:00:00Z',
      });

      expect(mockPrismaService.siteVisit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ salesExecId: 'exec-2' }),
        }),
      );
    });

    it('should assign to first project exec if no prior SVs exist', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-1',
        firstName: 'John',
      });
      mockPrismaService.projectAssignment.findMany.mockResolvedValue([
        { userId: 'exec-1' },
        { userId: 'exec-2' },
      ]);
      mockPrismaService.siteVisit.findFirst.mockResolvedValue(null);
      mockPrismaService.siteVisit.create.mockResolvedValue({
        id: 'sv-1',
        project: { name: 'ProjA' },
      });

      await service.createSiteVisit('lead-1', {
        userId: 'u-1',
        projectId: 'p-1',
        scheduledDate: '2026-01-01T00:00:00Z',
      });

      expect(mockPrismaService.siteVisit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ salesExecId: 'exec-1' }),
        }),
      );
    });
  });

  describe('updateSiteVisit', () => {
    it('should update site visit', async () => {
      mockPrismaService.siteVisit.update.mockResolvedValue({
        id: 'sv-1',
        salesExecId: 'u-1',
      });
      const result = await service.updateSiteVisit('sv-1', {
        status: 'CONDUCTED',
      } as unknown as UpdateSiteVisitDto);
      expect(result).toEqual({ id: 'sv-1', salesExecId: 'u-1' });
      expect(mockPrismaService.siteVisit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sv-1' },
          data: expect.objectContaining({ status: 'CONDUCTED' }),
        }),
      );
      expect(
        mockNotificationsService.checkDailyTaskCompletion,
      ).not.toHaveBeenCalled();
    });

    it('should trigger checkDailyTaskCompletion if status becomes COMPLETED', async () => {
      mockPrismaService.siteVisit.update.mockResolvedValue({
        id: 'sv-1',
        salesExecId: 'u-1',
        status: 'COMPLETED',
      });
      await service.updateSiteVisit('sv-1', {
        status: 'COMPLETED',
      });
      expect(
        mockNotificationsService.checkDailyTaskCompletion,
      ).toHaveBeenCalledWith('u-1', 'SITE_VISITS');
    });
  });

  describe('deleteSiteVisit', () => {
    it('should delete site visit', async () => {
      mockPrismaService.siteVisit.delete.mockResolvedValue({ id: 'sv-1' });
      const result = await service.deleteSiteVisit('sv-1');
      expect(result).toEqual({ id: 'sv-1' });
      expect(mockPrismaService.siteVisit.delete).toHaveBeenCalledWith({
        where: { id: 'sv-1' },
      });
    });
  });

  describe('arriveAtSiteVisit', () => {
    it('should record arrival location and time', async () => {
      mockPrismaService.siteVisit.update.mockResolvedValue({
        id: 'sv-1',
        arriveLatitude: 10,
        arriveLongitude: 20,
      });
      const result = await service.arriveAtSiteVisit('sv-1', {
        latitude: 10,
        longitude: 20,
      });
      expect(result).toEqual({
        id: 'sv-1',
        arriveLatitude: 10,
        arriveLongitude: 20,
      });
      expect(mockPrismaService.siteVisit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sv-1' },
          data: expect.objectContaining({
            arriveLatitude: 10,
            arriveLongitude: 20,
          }),
        }),
      );
    });
  });
});
