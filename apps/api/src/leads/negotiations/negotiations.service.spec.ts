import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { NegotiationsService } from './negotiations.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { BadRequestException } from '@nestjs/common';
import { CreateNegotiationDto } from './dto/negotiation.dto.js';

describe('NegotiationsService', () => {
  let service: NegotiationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    lead: {
      findUnique: jest.fn(),
    },
    negotiation: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegotiationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NegotiationsService>(NegotiationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNegotiations', () => {
    it('should throw an error if lead is not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(service.getNegotiations('invalid-lead-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a list of negotiations', async () => {
      const mockLead = { id: 'lead-1' };
      const mockNegotiations = [{ id: 'neg-1', askingPrice: 1000 }];

      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      mockPrismaService.negotiation.findMany.mockResolvedValue(
        mockNegotiations,
      );

      const result = await service.getNegotiations('lead-1');
      expect(result).toEqual(mockNegotiations);
      expect(mockPrismaService.negotiation.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-1' },
        orderBy: { id: 'desc' },
        include: {
          salesExec: {
            select: { username: true, email: true, displayUsername: true },
          },
        },
      });
    });
  });

  describe('createNegotiation', () => {
    const createData = {
      askingPrice: 1500,
      offeredPrice: 1400,
      objections: 'Too expensive',
      strategy: 'Offer 1450',
      title: 'Round 1',
      nextStep: 'Call back tomorrow',
    } as CreateNegotiationDto;

    it('should throw an error if lead is not found', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(
        service.createNegotiation('invalid-lead-id', 'user-1', createData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new negotiation', async () => {
      const mockLead = { id: 'lead-1' };
      const mockNegotiation = { id: 'neg-1', ...createData };

      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      mockPrismaService.negotiation.create.mockResolvedValue(mockNegotiation);

      const result = await service.createNegotiation(
        'lead-1',
        'user-1',
        createData,
      );
      expect(result).toEqual(mockNegotiation);
      expect(mockPrismaService.negotiation.create).toHaveBeenCalledWith({
        data: {
          leadId: 'lead-1',
          salesExecId: 'user-1',
          askingPrice: 1500,
          offeredPrice: 1400,
          customerObjections: 'Too expensive',
          managerSuggestion: 'Offer 1450',
          negotiationNotes: 'Round 1',
          nextActionPlan: 'Call back tomorrow',
        },
        include: {
          salesExec: {
            select: { username: true, email: true, displayUsername: true },
          },
        },
      });
    });
  });
});
