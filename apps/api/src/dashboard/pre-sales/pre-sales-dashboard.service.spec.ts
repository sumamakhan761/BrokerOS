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
import { PreSalesDashboardService } from './pre-sales-dashboard.service.js';
import { PreSalesPipelineService } from './pre-sales-pipeline.service.js';
import { PreSalesDailyTasksService } from './pre-sales-daily-tasks.service.js';
import { PreSalesWidgetsService } from './pre-sales-widgets.service.js';

describe('PreSalesDashboardService', () => {
  let service: PreSalesDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSalesDashboardService,
        { provide: PrismaService, useValue: {} },
        { provide: PreSalesPipelineService, useValue: {} },
        { provide: PreSalesDailyTasksService, useValue: {} },
        { provide: PreSalesWidgetsService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSalesDashboardService>(PreSalesDashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
