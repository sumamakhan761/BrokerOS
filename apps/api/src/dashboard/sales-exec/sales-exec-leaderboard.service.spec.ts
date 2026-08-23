import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {},
  PrismaClient: class {}
}));
import { PrismaService } from '../../lib/database/prisma.service.js';
import { SalesExecLeaderboardService } from './sales-exec-leaderboard.service.js';

describe('SalesExecLeaderboardService', () => {
  let service: SalesExecLeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesExecLeaderboardService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesExecLeaderboardService>(SalesExecLeaderboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
