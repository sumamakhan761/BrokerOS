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
import { PreSalesLeaderboardService } from '../pre-sales/pre-sales-leaderboard.service.js';
import { SalesExecLeaderboardService } from '../sales-exec/sales-exec-leaderboard.service.js';
import { LeaderboardService } from './leaderboard.service.js';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: PreSalesLeaderboardService, useValue: {} },
        { provide: SalesExecLeaderboardService, useValue: {} },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
