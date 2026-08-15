import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalsService } from './approvals.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationType } from '../generated/prisma/client.js';

jest.mock('../lib/database/prisma.service.js', () => ({
  PrismaService: class { },
}));

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    approvalRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
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

    service = module.get<ApprovalsService>(ApprovalsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequest', () => {
    it('should throw BadRequestException if SE not found or has no manager', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createRequest('se-id', 'Title', 'Desc')
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an approval request and send a notification', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ managerId: 'manager-id' });
      mockPrismaService.approvalRequest.create.mockResolvedValue({
        id: 'request-id',
        salesExecId: 'se-id',
        managerId: 'manager-id',
        status: 'REQUESTED',
        salesExec: { name: 'John Doe' },
      });

      const result = await service.createRequest('se-id', 'Test Title', 'Test Description');

      expect(mockPrismaService.approvalRequest.create).toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'manager-id',
          type: NotificationType.BOOKING_REQUEST,
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('request-id');
    });
  });

  describe('getRequests', () => {
    it('should return manager requests if user is SALES_MANAGER', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_MANAGER' } });
      mockPrismaService.approvalRequest.findMany.mockResolvedValue([{ id: 'req-1' }]);

      const result = await service.getRequests('manager-id');
      expect(mockPrismaService.approvalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { managerId: 'manager-id' } })
      );
      expect(result).toEqual([{ id: 'req-1' }]);
    });

    it('should return SE requests if user is SALES_EXECUTIVE', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_EXECUTIVE' } });
      mockPrismaService.approvalRequest.findMany.mockResolvedValue([{ id: 'req-2' }]);

      const result = await service.getRequests('se-id');
      expect(mockPrismaService.approvalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { salesExecId: 'se-id' } })
      );
      expect(result).toEqual([{ id: 'req-2' }]);
    });

    it('should return empty array for other roles', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'ADMIN' } });
      const result = await service.getRequests('admin-id');
      expect(result).toEqual([]);
    });
  });

  describe('getRequestDetails', () => {
    it('should throw NotFoundException if request not found', async () => {
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue(null);
      await expect(service.getRequestDetails('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return request details if found', async () => {
      const mockReq = { id: 'req-1', messages: [] };
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue(mockReq);
      const result = await service.getRequestDetails('req-1');
      expect(result).toEqual(mockReq);
    });
  });

  describe('addMessage', () => {
    it('should throw NotFoundException if request not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_MANAGER' } });
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.addMessage('invalid-id', 'user-id', { title: 'T', description: 'D' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if request is CLOSED', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_MANAGER' } });
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue({ status: 'CLOSED' });
      await expect(
        service.addMessage('req-1', 'user-id', { title: 'T', description: 'D' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve request and notify SE if manager approves', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_MANAGER' } });
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        salesExecId: 'se-id',
        status: 'REQUESTED',
      });
      mockPrismaService.approvalRequest.update.mockResolvedValue({
        id: 'req-1',
        manager: { name: 'Manager Name' },
      });

      await service.addMessage('req-1', 'manager-id', {
        title: 'Approved',
        description: 'Looks good',
        action: 'APPROVE',
      });

      expect(mockPrismaService.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'APPROVED' }),
        })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.REQUEST_APPROVED,
          userId: 'se-id',
        })
      );
    });

    it('should update request and notify manager if SE replies', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: { code: 'SALES_EXECUTIVE' } });
      mockPrismaService.approvalRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        managerId: 'manager-id',
        status: 'APPROVED',
      });
      mockPrismaService.approvalRequest.update.mockResolvedValue({
        id: 'req-1',
        salesExec: { name: 'SE Name' },
      });

      await service.addMessage('req-1', 'se-id', {
        title: 'Reply',
        description: 'Thanks',
      });

      expect(mockPrismaService.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'REQUESTED' }),
        })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.CHAT_MESSAGE,
          userId: 'manager-id',
        })
      );
    });
  });

  describe('closeRequest', () => {
    it('should update status to CLOSED', async () => {
      mockPrismaService.approvalRequest.update.mockResolvedValue({ id: 'req-1', status: 'CLOSED' });
      const result = await service.closeRequest('req-1');
      expect(result).toEqual({ id: 'req-1', status: 'CLOSED' });
      expect(mockPrismaService.approvalRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'CLOSED' },
      });
    });
  });
});
