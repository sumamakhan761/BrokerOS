import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  LeadStatus: {
    NEW: 'NEW',
    INTERESTED: 'INTERESTED',
  },
}));

import { NotesService } from './notes.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { TranscriptionService } from '../call-records/transcription.service.js';
import { LeadStatus } from '@brokeros/prisma';
import { CreateNoteDto } from './dto/create-note.dto.js';

jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

describe('NotesService', () => {
  let service: NotesService;
  let prismaService: PrismaService;
  let transcriptionService: TranscriptionService;

  const mockPrismaService = {
    lead: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    note: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockTranscriptionService = {
    generateAutoStatusAndNote: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TranscriptionService,
          useValue: mockTranscriptionService,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    prismaService = module.get<PrismaService>(PrismaService);
    transcriptionService =
      module.get<TranscriptionService>(TranscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotes', () => {
    it('should throw an error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(service.getNotes('invalid-lead-id')).rejects.toThrow(
        'Lead not found',
      );
    });

    it('should return notes for a valid lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-id' });
      mockPrismaService.note.findMany.mockResolvedValue([
        { id: 'note-1', content: 'test' },
      ]);

      const result = await service.getNotes('lead-id');
      expect(mockPrismaService.note.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-id' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true, displayUsername: true },
          },
        },
      });
      expect(result).toEqual([{ id: 'note-1', content: 'test' }]);
    });
  });

  describe('createNote', () => {
    it('should throw an error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      const dto: CreateNoteDto = { content: 'test', userId: 'user-id' };
      await expect(service.createNote('invalid-lead-id', dto)).rejects.toThrow(
        'Lead not found',
      );
    });

    it('should create a note without updating lead status', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-id',
        status: 'NEW',
      });
      mockPrismaService.note.create.mockResolvedValue({
        id: 'note-1',
        content: 'test',
      });

      const dto: CreateNoteDto = { content: 'test', userId: 'user-id' };
      const result = await service.createNote('lead-id', dto);

      expect(mockPrismaService.lead.update).not.toHaveBeenCalled();
      expect(mockPrismaService.note.create).toHaveBeenCalledWith({
        data: {
          leadId: 'lead-id',
          content: 'test',
          userId: 'user-id',
          statusAtTimeOfNote: undefined,
          noteType: undefined,
        },
        include: {
          user: {
            select: { username: true, email: true, displayUsername: true },
          },
        },
      });
      expect(result).toEqual({ id: 'note-1', content: 'test' });
    });

    it('should update lead status and create note', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-id',
        status: 'NEW',
      });
      mockPrismaService.note.create.mockResolvedValue({
        id: 'note-1',
        content: 'test',
      });

      const dto: CreateNoteDto = {
        content: 'test',
        userId: 'user-id',
        statusAtTimeOfNote: LeadStatus.INTERESTED,
        noteType: 'CALL',
      };
      await service.createNote('lead-id', dto);

      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-id' },
        data: { status: LeadStatus.INTERESTED, subStatus: 'PENDING' },
      });
      expect(mockPrismaService.note.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusAtTimeOfNote: LeadStatus.INTERESTED,
            noteType: 'CALL',
          }),
        }),
      );
    });
  });

  describe('generateAiTransition', () => {
    it('should throw an error if lead not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(
        service.generateAiTransition('invalid-lead-id', 'user-id'),
      ).rejects.toThrow('Lead not found');
    });

    it('should throw an error if AI could not generate transition', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-id',
        callRecords: [],
      });
      mockTranscriptionService.generateAutoStatusAndNote.mockResolvedValue(
        null,
      );

      await expect(
        service.generateAiTransition('lead-id', 'user-id'),
      ).rejects.toThrow('AI could not generate transition');
    });

    it('should update status and create AI transition note', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: 'lead-id',
        status: 'NEW',
        callRecords: [{ aiSummary: 'test summary' }],
      });
      mockTranscriptionService.generateAutoStatusAndNote.mockResolvedValue({
        suggestedStatus: LeadStatus.INTERESTED,
        transitionNote: 'Customer is interested',
      });
      mockPrismaService.note.create.mockResolvedValue({ id: 'ai-note' });

      const result = await service.generateAiTransition('lead-id', 'user-id');

      expect(
        mockTranscriptionService.generateAutoStatusAndNote,
      ).toHaveBeenCalledWith('NEW', ['test summary']);
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-id' },
        data: { status: LeadStatus.INTERESTED, subStatus: 'PENDING' },
      });
      expect(mockPrismaService.note.create).toHaveBeenCalledWith({
        data: {
          leadId: 'lead-id',
          content: 'Customer is interested',
          userId: 'user-id',
          statusAtTimeOfNote: LeadStatus.INTERESTED,
          noteType: 'AI_TRANSITION',
        },
        include: {
          user: {
            select: { username: true, email: true, displayUsername: true },
          },
        },
      });
      expect(result).toEqual({
        suggestedStatus: LeadStatus.INTERESTED,
        note: { id: 'ai-note' },
      });
    });
  });
});
