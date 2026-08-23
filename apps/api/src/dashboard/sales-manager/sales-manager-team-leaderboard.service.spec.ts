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
import { SalesManagerTeamLeaderboardService } from './sales-manager-team-leaderboard.service.js';

describe('SalesManagerTeamLeaderboardService', () => {
  let service: SalesManagerTeamLeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesManagerTeamLeaderboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesManagerTeamLeaderboardService>(SalesManagerTeamLeaderboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
