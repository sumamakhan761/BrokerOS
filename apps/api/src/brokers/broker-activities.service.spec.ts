import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));

import { BrokerActivitiesService } from './broker-activities.service.js';
import { PrismaService } from '../lib/database/prisma.service.js';
import { AddBrokerNoteDto, AddBrokerFollowUpDto, AddBrokerMeetingDto, ArriveAtMeetingDto } from './dto/broker.dto.js';

describe('BrokerActivitiesService', () => {
  let service: BrokerActivitiesService;
  const mockPrisma = {
    note: { create: jest.fn() },
    followUp: { create: jest.fn() },
    brokerMeeting: { create: jest.fn(), update: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrokerActivitiesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(BrokerActivitiesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should add note', async () => {
    mockPrisma.note.create.mockResolvedValue({ id: 'n-1' });
    const dto = { content: 'test' } as AddBrokerNoteDto;
    const res = await service.addNote('b-1', 'u-1', dto);
    expect(res.id).toBe('n-1');
  });

  it('should add follow up', async () => {
    mockPrisma.followUp.create.mockResolvedValue({ id: 'f-1' });
    const dto = { scheduledDate: new Date().toISOString() } as AddBrokerFollowUpDto;
    const res = await service.addFollowUp('b-1', 'u-1', dto);
    expect(res.id).toBe('f-1');
  });

  it('should add meeting', async () => {
    mockPrisma.brokerMeeting.create.mockResolvedValue({ id: 'm-1' });
    const dto = { scheduledAt: new Date().toISOString() } as AddBrokerMeetingDto;
    const res = await service.addMeeting('b-1', 'u-1', dto);
    expect(res.id).toBe('m-1');
  });

  it('should arrive at meeting', async () => {
    mockPrisma.brokerMeeting.update.mockResolvedValue({ id: 'm-1' });
    const dto = { latitude: 1, longitude: 1 } as ArriveAtMeetingDto;
    const res = await service.arriveAtMeeting('b-1', 'm-1', 'u-1', dto);
    expect(res.id).toBe('m-1');
  });
});
