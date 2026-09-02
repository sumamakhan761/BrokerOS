import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {},
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {},
}));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {},
  PrismaClient: class {},
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { ChannelPartnerDashboardService } from './channel-partner-dashboard.service.js';

describe('ChannelPartnerDashboardService', () => {
  let service: ChannelPartnerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelPartnerDashboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ChannelPartnerDashboardService>(
      ChannelPartnerDashboardService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
