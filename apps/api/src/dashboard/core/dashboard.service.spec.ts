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
import { DashboardService } from './dashboard.service.js';
import { PreSalesDashboardService } from '../pre-sales/pre-sales-dashboard.service.js';
import { ManagerDashboardService } from '../manager/manager-dashboard.service.js';
import { LeaderboardService } from './leaderboard.service.js';
import { SalesExecDashboardService } from '../sales-exec/sales-exec-dashboard.service.js';
describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: {} },
        { provide: PreSalesDashboardService, useValue: {} },
        { provide: ManagerDashboardService, useValue: {} },
        { provide: LeaderboardService, useValue: {} },
        { provide: SalesExecDashboardService, useValue: {} },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
