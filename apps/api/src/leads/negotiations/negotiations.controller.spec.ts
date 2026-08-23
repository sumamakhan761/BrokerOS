import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
import { CreateNegotiationDto } from './dto/negotiation.dto.js';

describe('NegotiationsController', () => {
  let controller: NegotiationsController;
  let service: NegotiationsService;

  const mockNegotiationsService = {
    getNegotiations: jest.fn(),
    createNegotiation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegotiationsController],
      providers: [
        {
          provide: NegotiationsService,
          useValue: mockNegotiationsService,
        },
      ],
    }).compile();

    controller = module.get<NegotiationsController>(NegotiationsController);
    service = module.get<NegotiationsService>(NegotiationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNegotiations', () => {
    it('should return negotiations for a lead', async () => {
      const mockResult = [{ id: 'neg-1' }];
      mockNegotiationsService.getNegotiations.mockResolvedValue(mockResult);

      const result = await controller.getNegotiations('lead-1');
      expect(result).toEqual(mockResult);
      expect(mockNegotiationsService.getNegotiations).toHaveBeenCalledWith('lead-1');
    });
  });

  describe('createNegotiation', () => {
    it('should create a negotiation using provided userId in body', async () => {
      const mockResult = { id: 'neg-1' };
      mockNegotiationsService.createNegotiation.mockResolvedValue(mockResult);

      const req = { user: { id: 'auth-user-1' } };
      const body = {
        userId: 'body-user-1',
        askingPrice: 1500,
        offeredPrice: 1400,
        objections: 'Too much',
        strategy: 'Discount',
        title: 'Round 1',
        nextStep: 'Follow up',
      } as CreateNegotiationDto;

      const result = await controller.createNegotiation('lead-1', req, body);
      
      expect(result).toEqual(mockResult);
      expect(mockNegotiationsService.createNegotiation).toHaveBeenCalledWith('lead-1', 'body-user-1', body);
    });

    it('should create a negotiation using req.user.id if userId not in body', async () => {
      const mockResult = { id: 'neg-1' };
      mockNegotiationsService.createNegotiation.mockResolvedValue(mockResult);

      const req = { user: { id: 'auth-user-1' } };
      const body = {
        askingPrice: 1500,
      } as CreateNegotiationDto;

      const result = await controller.createNegotiation('lead-1', req, body);
      
      expect(result).toEqual(mockResult);
      expect(mockNegotiationsService.createNegotiation).toHaveBeenCalledWith('lead-1', 'auth-user-1', body);
    });

    it('should throw error if user ID is missing everywhere', async () => {
      const req = { user: {} };
      const body = {};

      await expect(controller.createNegotiation('lead-1', req, body)).rejects.toThrow('User ID is required');
    });
  });
});
