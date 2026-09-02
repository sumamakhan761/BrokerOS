import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  NotificationType: { ACHIEVEMENT_MILESTONE: 'ACHIEVEMENT_MILESTONE' },
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');

jest.mock('p-queue', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockImplementation(async (fn) => {
      await fn();
    }),
  }));
});

jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'http://test.com/blob.mp3' }),
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
}));

import { CallRecordsService } from './call-records.service.js';
import { UploadCallRecordDto } from './dto/call-record.dto.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { TranscriptionService } from './transcription.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';

jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

describe('CallRecordsService', () => {
  let service: CallRecordsService;
  let prismaService: PrismaService;
  let transcriptionService: TranscriptionService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    lead: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    broker: {
      findFirst: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    callRecord: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
    },
    followUp: {
      create: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
  };

  const mockTranscriptionService = {
    transcribeAudio: jest.fn(),
    summarizeCall: jest.fn(),
    generateLeadScore: jest.fn(),
  };

  const mockNotificationsService = {
    checkDailyTaskCompletion: jest.fn().mockResolvedValue(null),
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallRecordsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TranscriptionService, useValue: mockTranscriptionService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CallRecordsService>(CallRecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
    transcriptionService =
      module.get<TranscriptionService>(TranscriptionService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCallRecord', () => {
    it('should return a call record', async () => {
      mockPrismaService.callRecord.findUnique.mockResolvedValue({ id: 'cr-1' });
      const res = await service.getCallRecord('cr-1');
      expect(res).toEqual({ id: 'cr-1' });
    });
  });

  describe('uploadCallRecord', () => {
    it('should return error if no lead or broker is found', async () => {
      mockPrismaService.lead.findFirst.mockResolvedValue(null);
      mockPrismaService.broker.findFirst.mockResolvedValue(null);
      const res = await service.uploadCallRecord(
        {
          originalname: 'test.mp3',
          buffer: Buffer.from(''),
        } as Express.Multer.File,
        {
          phoneNumber: '1234567890',
          startedAt: '123',
          endedAt: '124',
        },
      );
      expect(res).toEqual({
        success: false,
        message: 'No lead or broker found',
      });
    });

    it('should process call record, add to queue, and return success', async () => {
      mockPrismaService.lead.findFirst.mockResolvedValue({
        id: 'lead-1',
        assignedUserId: 'user-1',
      });
      mockPrismaService.callRecord.create.mockResolvedValue({
        id: 'cr-1',
        leadId: 'lead-1',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        role: { code: 'PRE_SALES' },
      });
      mockPrismaService.callRecord.count.mockResolvedValue(10); // Not a milestone

      // Mocks for the background queue
      mockTranscriptionService.transcribeAudio.mockResolvedValue('hello world');
      mockTranscriptionService.summarizeCall.mockResolvedValue({
        summary: 'summary',
        nextStepSuggestion: 'call again',
        extractedBudget: 50000,
        scheduleFollowUp: true,
        followUpIsoDate: new Date().toISOString(),
      });
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-1',
        _count: { callRecords: 1 },
      });
      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockTranscriptionService.generateLeadScore.mockResolvedValue({
        score: 90,
        category: 'HOT',
      });

      const res = await service.uploadCallRecord(
        {
          originalname: 'test.mp3',
          buffer: Buffer.from('audio'),
        } as Express.Multer.File,
        {
          phoneNumber: '1234567890',
          startedAt: '1234567890',
          endedAt: '1234567891',
        },
      );

      expect(res.success).toBe(true);
      expect(res.callRecord).toEqual({ id: 'cr-1', leadId: 'lead-1' });

      // Assert queue execution (since p-queue is mocked to run synchronously)
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockTranscriptionService.transcribeAudio).toHaveBeenCalled();
      expect(mockTranscriptionService.summarizeCall).toHaveBeenCalled();
      expect(mockTranscriptionService.generateLeadScore).toHaveBeenCalled();
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lead-1' },
        }),
      );
      expect(mockPrismaService.callRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cr-1' },
        }),
      );
    });
  });
});
