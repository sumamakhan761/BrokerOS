import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {}
}));
jest.mock('@brokeros/prisma', () => ({
  NotificationType: {},
  PrismaClient: class {}
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { PreSalesLeaderboardService } from './pre-sales-leaderboard.service.js';

describe('PreSalesLeaderboardService', () => {
  let service: PreSalesLeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesLeaderboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesLeaderboardService>(PreSalesLeaderboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
