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
import { SalesManagerDashboardService } from './sales-manager-dashboard.service.js';
import { SalesManagerWidgetsService } from './sales-manager-widgets.service.js';
import { SalesManagerDailyTasksService } from './sales-manager-daily-tasks.service.js';
import { SalesManagerTeamLeaderboardService } from './sales-manager-team-leaderboard.service.js';
describe('SalesManagerDashboardService', () => {
  let service: SalesManagerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesManagerDashboardService,
        { provide: PrismaService, useValue: {} },
        { provide: SalesManagerWidgetsService, useValue: {} },
        { provide: SalesManagerDailyTasksService, useValue: {} },
        { provide: SalesManagerTeamLeaderboardService, useValue: {} },
      ],
    }).compile();

    service = module.get<SalesManagerDashboardService>(SalesManagerDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
