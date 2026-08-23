import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { BrokerAiService } from './broker-ai.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';
import { TranscriptionService } from '../leads/call-records/transcription.service.js';

describe('BrokerAiService', () => {
  let service: BrokerAiService;
  const mockPrisma = {
    broker: { findUnique: jest.fn(), update: jest.fn() },
    note: { create: jest.fn() },
  };
  const mockTranscription = { generateAutoStatusAndNote: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokerAiService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TranscriptionService, useValue: mockTranscription },
      ],
    }).compile();
    service = module.get(BrokerAiService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should generate ai transition note', async () => {
    mockPrisma.broker.findUnique.mockResolvedValue({ id: 'b-1', status: 'NEW', callRecords: [{ aiSummary: 'test summary' }] });
    mockTranscription.generateAutoStatusAndNote.mockResolvedValue({ suggestedStatus: 'HOT', transitionNote: 'Note' });
    mockPrisma.note.create.mockResolvedValue({ id: 'n-1' });

    const res = await service.generateAiTransitionNote('b-1', 'u-1');
    expect(res.success).toBe(true);
    expect(res.newStatus).toBe('HOT');
  });
});
